# Apuração Shopee

Sistema web para apuração de números da sorte da Shopee, desenvolvido com Next.js e TypeScript.

## 🚀 Funcionalidades

- **Upload de arquivo CSV**: Interface para upload do arquivo de números da sorte
- **Apuração automática**: Processamento automático dos dados seguindo as regras de negócio
- **Interface moderna**: Design responsivo e intuitivo
- **Resultados detalhados**: Exibição completa dos números sorteados e anteriores

## 📋 Regras de Apuração

1. **Busca de série**: Se a série sorteada não existir, usa a série imediatamente inferior
2. **Busca de número**: Se o número sorteado não existir, usa o número inferior mais próximo
3. **9 números anteriores**: Busca os 9 números imediatamente anteriores na mesma série
4. **Evita duplicação**: Não permite chaves de contato duplicadas
5. **Série inferior**: Se não há números suficientes, completa com números da série inferior

## 🛠️ Tecnologias

- **Next.js 14**: Framework React com App Router
- **TypeScript**: Tipagem estática
- **Tailwind CSS**: Estilização
- **Lucide React**: Ícones
- **Vercel**: Deploy e hospedagem

## 📦 Instalação

```bash
# Clone o repositório
git clone <repository-url>
cd apuracao-shopee

# Instale as dependências
npm install

# Execute em desenvolvimento
npm run dev
```

## 🌐 Deploy no Vercel

1. **Conecte seu repositório** ao Vercel
2. **Configure o projeto**:
   - Framework: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
3. **Deploy automático** será realizado

## 📁 Estrutura do Projeto

```
├── app/
│   ├── globals.css          # Estilos globais
│   ├── layout.tsx           # Layout principal
│   └── page.tsx             # Página principal
├── lib/
│   └── apuracao.ts          # Lógica de apuração
├── package.json             # Dependências
├── tailwind.config.js       # Configuração Tailwind
├── tsconfig.json           # Configuração TypeScript
└── vercel.json             # Configuração Vercel
```

## 📊 Formato do CSV

O arquivo CSV deve conter as seguintes colunas:

```csv
chave_contato,data,produto,data_referencia,numero_sorte
A7B69505-B83B-EE11-82FA-A4823B48F002,2024-10-04,Fatura_Protegida,2025-07-31,0049474
```

## 🎯 Como Usar

1. **Acesse a aplicação** no navegador
2. **Faça upload** do arquivo CSV
3. **Configure os parâmetros**:
   - Série sorteada (ex: 47)
   - Número sorteado (ex: 45668)
4. **Clique em "Realizar Apuração"**
5. **Visualize os resultados**:
   - Número sorteado
   - 9 números anteriores
   - Estatísticas

## 🔧 Scripts Disponíveis

```bash
npm run dev      # Desenvolvimento
npm run build    # Build para produção
npm run start    # Servidor de produção
npm run lint     # Verificação de código
```

## 📝 Licença

Este projeto é de uso interno da Shopee.
