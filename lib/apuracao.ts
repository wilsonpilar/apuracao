export interface NumeroSorte {
  numero_sorte: string;
  serie: string;
  numero_sorte_base: string;
  chave_contato: string;
  data: string;
  produto: string;
}

export interface ResultadoApuração {
  numeroSorteado: NumeroSorte;
  numerosAnteriores: Array<{
    numero: string;
    numero_completo: string;
    chave_contato: string;
    serie: string;
  }>;
  estatisticas: {
    totalRegistros: number;
    seriesDisponiveis: string[];
    serieUtilizada: string;
    numerosEncontrados: number;
  };
}

export function processarCSV(csvData: string): NumeroSorte[] {
  console.log('=== DEBUG: PROCESSANDO CSV ===');
  console.log('Tamanho do CSV:', csvData.length, 'caracteres');
  
  const lines = csvData.split('\n');
  console.log('Total de linhas:', lines.length);
  
  const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));
  console.log('Headers encontrados:', headers);
  
  const data: NumeroSorte[] = [];

  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim()) {
      const values = lines[i].split(',').map(v => v.replace(/"/g, ''));
      const row: any = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index];
      });

      // Criar colunas serie e numero_sorte_base
      const numeroSorte = row.numero_sorte || '';
      const serie = numeroSorte.substring(0, 2);
      const numeroSorteBase = numeroSorte.substring(2);

      data.push({
        numero_sorte: numeroSorte,
        serie: serie,
        numero_sorte_base: numeroSorteBase,
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
    
    // Mostrar séries únicas
    const seriesUnicas = Array.from(new Set(data.map(item => item.serie)));
    console.log('Séries únicas encontradas:', seriesUnicas.sort());
    
    // Mostrar estatísticas por série
    seriesUnicas.forEach(serie => {
      const count = data.filter(item => item.serie === serie).length;
      console.log(`Série ${serie}: ${count} registros`);
    });
  }

  return data;
}

export function encontrarSerieAdequada(planilhaBase: NumeroSorte[], serieSorteada: string): string {
  const seriesDisponiveis = Array.from(new Set(planilhaBase.map(item => item.serie)));
  
  if (seriesDisponiveis.includes(serieSorteada)) {
    return serieSorteada;
  }
  
  // Ordenar séries numericamente
  const seriesNumericas = seriesDisponiveis.map(s => parseInt(s)).sort((a, b) => a - b);
  const serieSorteadaInt = parseInt(serieSorteada);
  
  // Encontrar série imediatamente inferior
  for (let i = seriesNumericas.length - 1; i >= 0; i--) {
    if (seriesNumericas[i] < serieSorteadaInt) {
      return seriesNumericas[i].toString().padStart(2, '0');
    }
  }
  
  // Se não há série inferior, usar a maior disponível
  return Math.max(...seriesNumericas).toString().padStart(2, '0');
}

export function encontrarNumeroAdequado(dadosSerie: NumeroSorte[], numeroSorteado: string): string {
  const numerosDisponiveis = dadosSerie.map(item => parseInt(item.numero_sorte_base));
  const numeroSorteadoInt = parseInt(numeroSorteado);
  
  if (numerosDisponiveis.includes(numeroSorteadoInt)) {
    return numeroSorteado;
  }
  
  // Encontrar número inferior mais próximo
  const numerosInferiores = numerosDisponiveis.filter(num => num < numeroSorteadoInt);
  
  if (numerosInferiores.length > 0) {
    const numeroInferiorMaisProximo = Math.max(...numerosInferiores);
    return numeroInferiorMaisProximo.toString().padStart(5, '0');
  }
  
  // Se não há números inferiores, usar o menor disponível
  const numeroMenor = Math.min(...numerosDisponiveis);
  return numeroMenor.toString().padStart(5, '0');
}

export function encontrarProximoNumeroInferior(
  dadosSerie: NumeroSorte[], 
  numeroAtual: string, 
  chavesUtilizadas: Set<string>
): { numero: string; chave: string } | null {
  const numerosDisponiveis = dadosSerie.map(item => parseInt(item.numero_sorte_base));
  const numeroAtualInt = parseInt(numeroAtual);
  
  // Filtrar números inferiores ao atual
  const numerosInferiores = numerosDisponiveis.filter(num => num < numeroAtualInt);
  numerosInferiores.sort((a, b) => b - a); // Ordenar decrescente
  
  for (const num of numerosInferiores) {
    const registrosNumero = dadosSerie.filter(item => parseInt(item.numero_sorte_base) === num);
    
    for (const registro of registrosNumero) {
      if (!chavesUtilizadas.has(registro.chave_contato)) {
        return {
          numero: num.toString().padStart(5, '0'),
          chave: registro.chave_contato
        };
      }
    }
  }
  
  return null;
}

export function realizarApuracao(
  planilhaBase: NumeroSorte[], 
  serieSorteada: string, 
  numeroSorteado: string
): ResultadoApuração {
  console.log('=== DEBUG: INÍCIO DA APURAÇÃO ===');
  console.log('Série sorteada:', serieSorteada);
  console.log('Número sorteado:', numeroSorteado);
  console.log('Total de registros na planilha:', planilhaBase.length);
  
  // 1. Encontrar série adequada
  const serieFinal = encontrarSerieAdequada(planilhaBase, serieSorteada);
  console.log('Série final encontrada:', serieFinal);
  
  // 2. Filtrar dados da série
  const dadosSerie = planilhaBase.filter(item => item.serie === serieFinal);
  console.log('Total de números na série', serieFinal + ':', dadosSerie.length);
  
  // Mostrar alguns exemplos da série
  if (dadosSerie.length > 0) {
    console.log('Exemplos de números na série:', dadosSerie.slice(0, 5).map(item => ({
      numero_sorte: item.numero_sorte,
      numero_sorte_base: item.numero_sorte_base
    })));
  }
  
  // 3. Encontrar número adequado
  const numeroFinal = encontrarNumeroAdequado(dadosSerie, numeroSorteado);
  console.log('Número final encontrado:', numeroFinal);
  
  // 4. Encontrar o registro do número sorteado
  const registro = dadosSerie.find(item => item.numero_sorte_base === numeroFinal);
  console.log('Registro encontrado:', registro ? 'SIM' : 'NÃO');
  
  if (!registro) {
    console.log('=== DEBUG: REGISTRO NÃO ENCONTRADO ===');
    console.log('Número final procurado:', numeroFinal);
    console.log('Números disponíveis na série:', dadosSerie.map(item => item.numero_sorte_base));
    console.log('Verificando se existe algum registro com número_sorte_base === numeroFinal:');
    
    const registrosComNumero = dadosSerie.filter(item => item.numero_sorte_base === numeroFinal);
    console.log('Registros com número final:', registrosComNumero.length);
    
    if (registrosComNumero.length > 0) {
      console.log('Primeiro registro encontrado:', registrosComNumero[0]);
    }
    
    throw new Error(`Registro não encontrado para número ${numeroFinal} na série ${serieFinal}`);
  }
  
  console.log('=== DEBUG: REGISTRO ENCONTRADO ===');
  console.log('Registro:', registro);
  
  // 5. Buscar os 9 números anteriores
  const chavesUtilizadas = new Set([registro.chave_contato]);
  const numerosAnteriores: Array<{
    numero: string;
    numero_completo: string;
    chave_contato: string;
    serie: string;
  }> = [];
  
  let numeroAtual = numeroFinal;
  let serieAtual = serieFinal;
  
  console.log('=== DEBUG: BUSCANDO NÚMEROS ANTERIORES ===');
  console.log('Número atual inicial:', numeroAtual);
  console.log('Série atual:', serieAtual);
  
  // Primeiro, tentar encontrar números na série atual
  for (let i = 0; i < 9; i++) {
    const resultado = encontrarProximoNumeroInferior(dadosSerie, numeroAtual, chavesUtilizadas);
    
    if (resultado) {
      numerosAnteriores.push({
        numero: resultado.numero,
        numero_completo: `${serieAtual}${resultado.numero}`,
        chave_contato: resultado.chave,
        serie: serieAtual
      });
      chavesUtilizadas.add(resultado.chave);
      numeroAtual = resultado.numero;
      console.log(`Número anterior ${i + 1}:`, resultado.numero);
    } else {
      console.log(`Não foi possível encontrar o ${i + 1}º número anterior`);
      break;
    }
  }
  
  // Se não encontrou todos os 9 números, buscar na próxima série inferior
  const numerosFaltantes = 9 - numerosAnteriores.length;
  
  if (numerosFaltantes > 0) {
    console.log(`Números faltantes: ${numerosFaltantes}`);
    
    const seriesDisponiveis = Array.from(new Set(planilhaBase.map(item => item.serie)));
    const seriesNumericas = seriesDisponiveis.map(s => parseInt(s)).sort((a, b) => a - b);
    const serieAtualInt = parseInt(serieAtual);
    
    for (let i = seriesNumericas.length - 1; i >= 0; i--) {
      if (seriesNumericas[i] < serieAtualInt) {
        const serieInferior = seriesNumericas[i].toString().padStart(2, '0');
        console.log(`Buscando na série inferior: ${serieInferior}`);
        
        const dadosSerieInferior = planilhaBase.filter(item => item.serie === serieInferior);
        
        // Ordenar por número base decrescente
        dadosSerieInferior.sort((a, b) => parseInt(b.numero_sorte_base) - parseInt(a.numero_sorte_base));
        
        let numerosEncontradosInferior = 0;
        
        for (const item of dadosSerieInferior) {
          if (!chavesUtilizadas.has(item.chave_contato)) {
            numerosAnteriores.push({
              numero: item.numero_sorte_base,
              numero_completo: `${serieInferior}${item.numero_sorte_base}`,
              chave_contato: item.chave_contato,
              serie: serieInferior
            });
            chavesUtilizadas.add(item.chave_contato);
            numerosEncontradosInferior++;
            console.log(`Número da série inferior ${numerosEncontradosInferior}:`, item.numero_sorte_base);
            
            if (numerosEncontradosInferior >= numerosFaltantes) {
              break;
            }
          }
        }
        
        break;
      }
    }
  }
  
  console.log('=== DEBUG: APURAÇÃO CONCLUÍDA ===');
  console.log('Total de números anteriores encontrados:', numerosAnteriores.length);
  
  return {
    numeroSorteado: registro,
    numerosAnteriores,
    estatisticas: {
      totalRegistros: planilhaBase.length,
      seriesDisponiveis: Array.from(new Set(planilhaBase.map(item => item.serie))).sort(),
      serieUtilizada: serieFinal,
      numerosEncontrados: numerosAnteriores.length
    }
  };
}
