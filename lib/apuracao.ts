export interface NumeroSorte {
  numero_sorte: string;
  chave_contato: string;
  data: string;
  produto: string;
}

export interface ResultadoApuração {
  numeroSorteado: NumeroSorte;
  numerosSelecionados: Array<{
    numero: string;
    chave_contato: string;
    posicao: number;
  }>;
  estatisticas: {
    totalRegistros: number;
    chavesIgnoradas: number;
    numerosEncontrados: number;
  };
}

export function processarCSV(csvData: string): NumeroSorte[] {
  console.log('=== DEBUG: PROCESSANDO CSV ===');
  console.log('Tamanho do CSV:', csvData.length, 'caracteres');
  
  const lines = csvData.split('\n');
  console.log('Total de linhas:', lines.length);
  
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
  console.log('Headers encontrados:', headers);
  
  const data: NumeroSorte[] = [];

  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim()) {
      const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
      const row: any = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index];
      });

      data.push({
        numero_sorte: row.numero_sorte || '',
        chave_contato: row.chave_contato || '',
        data: row.data || '',
        produto: row.produto || ''
      });
    }
  }

  console.log('Total de registros processados:', data.length);
  
  // Mostrar alguns exemplos
  if (data.length > 0) {
    console.log('Primeiros 3 registros:', data.slice(0, 3));
    console.log('Últimos 3 registros:', data.slice(-3));
    
    // Mostrar alguns números únicos para debug
    const numerosUnicos = Array.from(new Set(data.map(item => item.numero_sorte))).slice(0, 10);
    console.log('Primeiros 10 números únicos:', numerosUnicos);
  }

  return data;
}

export function realizarApuracao(
  planilhaBase: NumeroSorte[], 
  numeroSorteado: string,
  chavesIgnoradas: string[]
): ResultadoApuração {
  console.log('=== DEBUG: INÍCIO DA APURAÇÃO ===');
  console.log('Número sorteado:', numeroSorteado);
  console.log('Chaves ignoradas:', chavesIgnoradas);
  console.log('Total de registros na planilha:', planilhaBase.length);
  
  if (!planilhaBase || planilhaBase.length === 0) {
    throw new Error('Planilha base está vazia');
  }
  
  if (!numeroSorteado) {
    throw new Error('Número sorteado não informado');
  }
  
  // Criar conjunto de chaves ignoradas para busca mais eficiente
  const chavesIgnoradasSet = new Set(chavesIgnoradas);
  console.log('Total de chaves ignoradas:', chavesIgnoradasSet.size);
  
  // Debug: mostrar alguns números disponíveis
  const numerosDisponiveis = planilhaBase.slice(0, 10).map(item => item.numero_sorte);
  console.log('Primeiros 10 números disponíveis:', numerosDisponiveis);
  
  // 1. Primeiro, tentar encontrar exatamente o número sorteado
  let numeroEncontrado = planilhaBase.find(item => 
    item.numero_sorte === numeroSorteado && 
    !chavesIgnoradasSet.has(item.chave_contato)
  );
  
  if (numeroEncontrado) {
    console.log('Número sorteado encontrado exatamente:', numeroSorteado);
  } else {
    console.log('Número sorteado não encontrado, buscando próximo inferior...');
    console.log('Verificando se o número existe mas tem chave ignorada...');
    
    // Verificar se o número existe mas tem chave ignorada
    const numeroComChaveIgnorada = planilhaBase.find(item => item.numero_sorte === numeroSorteado);
    if (numeroComChaveIgnorada) {
      console.log('Número existe mas tem chave ignorada:', numeroComChaveIgnorada.chave_contato);
    }
    
    // 2. Se não encontrou, buscar o próximo número inferior
    const numeroSorteadoInt = parseInt(numeroSorteado);
    console.log('Número sorteado convertido para inteiro:', numeroSorteadoInt);
    
    if (isNaN(numeroSorteadoInt)) {
      throw new Error('Número sorteado não é válido');
    }
    
    // Filtrar números menores que o sorteado e que não tenham chave ignorada
    const numerosMenores = planilhaBase
      .filter(item => {
        const numeroInt = parseInt(item.numero_sorte);
        const ehMenor = !isNaN(numeroInt) && numeroInt < numeroSorteadoInt;
        const naoTemChaveIgnorada = !chavesIgnoradasSet.has(item.chave_contato);
        
        if (ehMenor && naoTemChaveIgnorada) {
          console.log('Número candidato encontrado:', item.numero_sorte, 'Chave:', item.chave_contato);
        }
        
        return ehMenor && naoTemChaveIgnorada;
      })
      .sort((a, b) => parseInt(b.numero_sorte) - parseInt(a.numero_sorte)); // Ordenar decrescente
    
    console.log('Total de números menores encontrados:', numerosMenores.length);
    console.log('Primeiros 5 números menores:', numerosMenores.slice(0, 5).map(item => item.numero_sorte));
    
    if (numerosMenores.length > 0) {
      numeroEncontrado = numerosMenores[0];
      console.log('Próximo número inferior encontrado:', numeroEncontrado.numero_sorte);
    } else {
      console.log('Nenhum número menor encontrado. Verificando todos os números disponíveis...');
      
      // Debug: mostrar todos os números únicos para verificar
      const todosNumeros = Array.from(new Set(planilhaBase.map(item => item.numero_sorte))).sort();
      console.log('Todos os números únicos disponíveis (primeiros 20):', todosNumeros.slice(0, 20));
      
      throw new Error('Não foi possível encontrar o número sorteado nem um número inferior válido');
    }
  }
  
  console.log('=== DEBUG: NÚMERO PRINCIPAL ENCONTRADO ===');
  console.log('Número:', numeroEncontrado.numero_sorte);
  console.log('Chave:', numeroEncontrado.chave_contato);
  
  // 3. Agora buscar os próximos 15 números (incluindo o principal = 16 total)
  const numerosSelecionados: Array<{
    numero: string;
    chave_contato: string;
    posicao: number;
  }> = [];
  
  // Adicionar o número principal
  numerosSelecionados.push({
    numero: numeroEncontrado.numero_sorte,
    chave_contato: numeroEncontrado.chave_contato,
    posicao: 1
  });
  
  // Conjunto para controlar chaves já utilizadas
  const chavesUtilizadas = new Set([numeroEncontrado.chave_contato]);
  
  // Buscar os próximos 15 números
  let numeroAtual = numeroEncontrado.numero_sorte;
  let numerosEncontrados = 1;
  
  console.log('=== DEBUG: BUSCANDO PRÓXIMOS 15 NÚMEROS ===');
  
  while (numerosEncontrados < 16) {
    const numeroAtualInt = parseInt(numeroAtual);
    
    // Buscar o próximo número inferior que não tenha chave duplicada
    const proximoNumero = planilhaBase
      .filter(item => {
        const numeroInt = parseInt(item.numero_sorte);
        return !isNaN(numeroInt) && 
               numeroInt < numeroAtualInt && 
               !chavesUtilizadas.has(item.chave_contato) &&
               !chavesIgnoradasSet.has(item.chave_contato);
      })
      .sort((a, b) => parseInt(b.numero_sorte) - parseInt(a.numero_sorte))[0];
    
    if (proximoNumero) {
      numerosSelecionados.push({
        numero: proximoNumero.numero_sorte,
        chave_contato: proximoNumero.chave_contato,
        posicao: numerosEncontrados + 1
      });
      
      chavesUtilizadas.add(proximoNumero.chave_contato);
      numeroAtual = proximoNumero.numero_sorte;
      numerosEncontrados++;
      
      console.log(`Número ${numerosEncontrados}:`, proximoNumero.numero_sorte, 'Chave:', proximoNumero.chave_contato);
    } else {
      console.log(`Não foi possível encontrar o ${numerosEncontrados + 1}º número`);
      break;
    }
  }
  
  console.log('=== DEBUG: APURAÇÃO CONCLUÍDA ===');
  console.log('Total de números encontrados:', numerosSelecionados.length);
  
  return {
    numeroSorteado: numeroEncontrado,
    numerosSelecionados,
    estatisticas: {
      totalRegistros: planilhaBase.length,
      chavesIgnoradas: chavesIgnoradasSet.size,
      numerosEncontrados: numerosSelecionados.length
    }
  };
}


