'use client';

import { useState } from 'react';
import { Upload, FileText, Users, Hash, AlertCircle } from 'lucide-react';
import { processarCSV, realizarApuracao } from '@/lib/apuracao';

export default function Home() {
  const [csvData, setCsvData] = useState<string>('');
  const [numeroSorteado, setNumeroSorteado] = useState('');
  const [chavesIgnoradas, setChavesIgnoradas] = useState('');
  const [resultado, setResultado] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setCsvData(content);
        setError('');
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResultado(null);

    try {
      if (!csvData) {
        throw new Error('Por favor, faça upload do arquivo CSV');
      }

      if (!numeroSorteado) {
        throw new Error('Por favor, informe o número sorteado');
      }

      if (numeroSorteado.length !== 7) {
        throw new Error('O número sorteado deve ter exatamente 7 dígitos');
      }

      // Processar CSV
      const planilhaBase = processarCSV(csvData);
      
      // Processar chaves ignoradas
      const chavesIgnoradasArray = chavesIgnoradas
        .split('\n')
        .map(chave => chave.trim())
        .filter(chave => chave.length > 0);

      // Realizar apuração
      const resultadoApuracao = realizarApuracao(planilhaBase, numeroSorteado, chavesIgnoradasArray);
      
      setResultado(resultadoApuracao);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Sistema de Apuração de Números da Sorte
          </h1>
          <p className="text-gray-600">
            Faça upload do arquivo CSV e informe o número sorteado para realizar a apuração
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulário */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
              <FileText className="mr-2" />
              Configuração da Apuração
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Upload do CSV */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Arquivo CSV
                </label>
                <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  csvData 
                    ? 'border-green-400 bg-green-50' 
                    : 'border-gray-300 bg-gray-50 hover:border-blue-400'
                }`}>
                  <Upload className={`mx-auto h-12 w-12 mb-4 ${
                    csvData ? 'text-green-500' : 'text-gray-400'
                  }`} />
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="csv-upload"
                  />
                  <label htmlFor="csv-upload" className="cursor-pointer">
                    {csvData ? (
                      <span className="text-green-600 font-medium">
                        Arquivo carregado ✓
                      </span>
                    ) : (
                      <>
                        <span className="text-blue-600 hover:text-blue-800 font-medium">
                          Clique para fazer upload
                        </span>
                        <span className="text-gray-500"> ou arraste o arquivo aqui</span>
                      </>
                    )}
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                    Formato esperado: chave_contato, data, produto, data_referencia, numero_sorte
                  </p>
                </div>
              </div>

              {/* Número Sorteado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número Sorteado (7 dígitos)
                </label>
                <input
                  type="text"
                  value={numeroSorteado}
                  onChange={(e) => setNumeroSorteado(e.target.value.replace(/\D/g, '').slice(0, 7))}
                  placeholder="0000000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-900 placeholder-gray-500"
                  maxLength={7}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Digite exatamente 7 dígitos (pode começar com zero)
                </p>
              </div>

              {/* Chaves Ignoradas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chaves de Contato Ignoradas
                </label>
                <textarea
                  value={chavesIgnoradas}
                  onChange={(e) => setChavesIgnoradas(e.target.value)}
                  placeholder="Digite uma chave por linha para ignorar na seleção"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-900 placeholder-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Uma chave por linha. Deixe vazio se não houver chaves para ignorar.
                </p>
              </div>

              {/* Botão Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Processando...' : 'Realizar Apuração'}
              </button>
            </form>
          </div>

          {/* Resultados */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
              <Hash className="mr-2" />
              Resultado da Apuração
            </h2>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                  <p className="text-red-800">{error}</p>
                </div>
              </div>
            )}

            {resultado && (
              <div className="space-y-6">
                {/* Número Sorteado */}
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">
                    Número Sorteado Principal
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Número:</span>
                      <span className="ml-2 font-mono text-lg text-gray-900">{resultado.numeroSorteado.numero_sorte}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Chave:</span>
                      <span className="ml-2 font-mono text-xs break-all text-gray-700">{resultado.numeroSorteado.chave_contato}</span>
                    </div>
                  </div>
                </div>

                {/* Números Selecionados */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Números Selecionados ({resultado.numerosSelecionados.length} total)
                  </h3>
                  <div className="max-h-96 overflow-y-auto">
                    <div className="grid gap-2">
                      {resultado.numerosSelecionados.map((item: any, index: number) => (
                        <div
                          key={index}
                          className={`p-3 rounded-md border ${
                            item.posicao === 1
                              ? 'bg-blue-50 border-blue-200'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                item.posicao === 1
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                #{item.posicao}
                              </span>
                              <span className="font-mono text-lg text-gray-900">{item.numero}</span>
                            </div>
                            <span className="text-xs text-gray-600 font-mono break-all">
                              {item.chave_contato}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Estatísticas */}
                <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Estatísticas</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Total de registros:</span>
                      <span className="ml-2 text-gray-900">{resultado.estatisticas.totalRegistros.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Chaves ignoradas:</span>
                      <span className="ml-2 text-gray-900">{resultado.estatisticas.chavesIgnoradas}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Números encontrados:</span>
                      <span className="ml-2 text-gray-900">{resultado.estatisticas.numerosEncontrados}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!resultado && !error && (
              <div className="text-center text-gray-500 py-12">
                <Users className="mx-auto h-12 w-12 mb-4" />
                <p>Faça upload do arquivo CSV e configure os parâmetros para ver os resultados</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
