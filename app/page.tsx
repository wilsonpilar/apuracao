'use client';

import { useState } from 'react';
import { Upload, FileText, Calculator, Users, Award } from 'lucide-react';
import { processarCSV, realizarApuracao, ResultadoApuração } from '../lib/apuracao';

export default function Home() {
  const [csvData, setCsvData] = useState<string>('');
  const [serieSorteada, setSerieSorteada] = useState('47');
  const [numeroSorteado, setNumeroSorteado] = useState('45668');
  const [resultado, setResultado] = useState<ResultadoApuração | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setCsvData(text);
        setError('');
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = () => {
    if (!csvData) {
      setError('Por favor, faça upload de um arquivo CSV');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const planilhaBase = processarCSV(csvData);
      const resultadoApuracao = realizarApuracao(planilhaBase, serieSorteada, numeroSorteado);
      setResultado(resultadoApuracao);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar dados');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Apuração Shopee
          </h1>
          <p className="text-gray-600">
            Sistema de apuração de números da sorte
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center mb-4">
            <Upload className="w-6 h-6 text-blue-500 mr-2" />
            <h2 className="text-xl font-semibold">Upload do Arquivo CSV</h2>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selecione o arquivo CSV
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          {csvData && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-green-500 mr-2" />
                <span className="text-green-700">Arquivo carregado com sucesso!</span>
              </div>
            </div>
          )}
        </div>

        {/* Parameters Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center mb-4">
            <Calculator className="w-6 h-6 text-blue-500 mr-2" />
            <h2 className="text-xl font-semibold">Parâmetros do Sorteio</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Série Sorteada
              </label>
              <input
                type="text"
                value={serieSorteada}
                onChange={(e) => setSerieSorteada(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: 47"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número Sorteado
              </label>
              <input
                type="text"
                value={numeroSorteado}
                onChange={(e) => setNumeroSorteado(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: 45668"
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !csvData}
            className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Processando...' : 'Realizar Apuração'}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-8">
            <div className="flex items-center">
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Results Section */}
        {resultado && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-6">
              <Award className="w-6 h-6 text-blue-500 mr-2" />
              <h2 className="text-xl font-semibold">Resultado da Apuração</h2>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{resultado.estatisticas.totalRegistros}</div>
                <div className="text-sm text-gray-600">Total de Registros</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{resultado.estatisticas.serieUtilizada}</div>
                <div className="text-sm text-gray-600">Série Utilizada</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{resultado.estatisticas.numerosEncontrados}</div>
                <div className="text-sm text-gray-600">Números Anteriores</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{resultado.estatisticas.seriesDisponiveis.length}</div>
                <div className="text-sm text-gray-600">Séries Disponíveis</div>
              </div>
            </div>

            {/* Winner Number */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg mb-6">
              <h3 className="text-lg font-semibold mb-2">Número Sorteado</h3>
              <div className="text-3xl font-bold mb-2">{resultado.numeroSorteado.numero_sorte}</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-semibold">Série:</span> {resultado.numeroSorteado.serie}
                </div>
                <div>
                  <span className="font-semibold">Número Base:</span> {resultado.numeroSorteado.numero_sorte_base}
                </div>
                <div>
                  <span className="font-semibold">Produto:</span> {resultado.numeroSorteado.produto}
                </div>
              </div>
            </div>

            {/* Previous Numbers */}
            <div>
              <div className="flex items-center mb-4">
                <Users className="w-5 h-5 text-blue-500 mr-2" />
                <h3 className="text-lg font-semibold">9 Números Anteriores</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {resultado.numerosAnteriores.map((numero, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        Série {numero.serie}
                      </span>
                    </div>
                    <div className="text-lg font-bold text-gray-800 mb-2">
                      {numero.numero_completo}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {numero.chave_contato}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
