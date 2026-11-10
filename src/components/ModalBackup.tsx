import React, { useRef, useState } from 'react';
import { Download, Upload, FileText, Table, Check, AlertCircle, Copy } from 'lucide-react';

interface ModalBackupProps {
  onExportarJSON: () => string;
  onImportarJSON: (jsonString: string) => boolean;
  onExportarMarkdown: () => string;
  onExportarCSV: () => string;
  onClose: () => void;
}

export const ModalBackup: React.FC<ModalBackupProps> = ({
  onExportarJSON,
  onImportarJSON,
  onExportarMarkdown,
  onExportarCSV,
  onClose
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  const baixarArquivo = (conteudo: string, nomeArquivo: string, tipoMime: string) => {
    const blob = new Blob([conteudo], { type: tipoMime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nomeArquivo;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadJSON = () => {
    const json = onExportarJSON();
    baixarArquivo(json, `biblioteca-imaginaria-backup-${new Date().toISOString().split('T')[0]}.json`, 'application/json');
    setMensagemSucesso('Backup JSON exportado com sucesso!');
    setTimeout(() => setMensagemSucesso(null), 3000);
  };

  const handleDownloadMarkdown = () => {
    const md = onExportarMarkdown();
    baixarArquivo(md, `biblioteca-imaginaria-${new Date().toISOString().split('T')[0]}.md`, 'text/markdown');
    setMensagemSucesso('Acervo exportado em Markdown com sucesso!');
    setTimeout(() => setMensagemSucesso(null), 3000);
  };

  const handleDownloadCSV = () => {
    const csv = onExportarCSV();
    baixarArquivo(csv, `biblioteca-imaginaria-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
    setMensagemSucesso('Tabela exportada em CSV com sucesso!');
    setTimeout(() => setMensagemSucesso(null), 3000);
  };

  const handleCopiarMarkdown = () => {
    const md = onExportarMarkdown();
    navigator.clipboard.writeText(md);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  const handleArquivoSelecionado = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const conteudo = event.target?.result as string;
      const sucesso = onImportarJSON(conteudo);
      if (sucesso) {
        setMensagemSucesso('Estado completo restaurado com sucesso!');
        setMensagemErro(null);
        setTimeout(() => setMensagemSucesso(null), 4000);
      } else {
        setMensagemErro('Arquivo JSON inválido ou incompatível.');
        setMensagemSucesso(null);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 animate-fadeIn">
      <div className="bg-library-paper dark:bg-library-darkPaper w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-library-darkBorder text-slate-800 dark:text-slate-100 p-6 space-y-6">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white">
              Exportação & Backup de Dados
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Seus dados residem exclusivamente no seu navegador (sem tracking ou nuvem externa).
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            ✕
          </button>
        </div>

        {mensagemSucesso && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs rounded-lg flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{mensagemSucesso}</span>
          </div>
        )}

        {mensagemErro && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{mensagemErro}</span>
          </div>
        )}

        {/* Opções de Exportação */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Exportar Formatos
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={handleDownloadJSON}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-amber-500 dark:hover:border-amber-500 bg-white dark:bg-slate-900 flex flex-col items-center gap-2 text-center transition-all group"
            >
              <Download className="w-5 h-5 text-amber-600 group-hover:scale-110 transition-transform" />
              <div>
                <div className="font-bold text-xs text-slate-800 dark:text-slate-200">Backup JSON</div>
                <div className="text-[10px] text-slate-500">Completo (estado total)</div>
              </div>
            </button>

            <button
              onClick={handleDownloadMarkdown}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-amber-500 dark:hover:border-amber-500 bg-white dark:bg-slate-900 flex flex-col items-center gap-2 text-center transition-all group"
            >
              <FileText className="w-5 h-5 text-purple-600 group-hover:scale-110 transition-transform" />
              <div>
                <div className="font-bold text-xs text-slate-800 dark:text-slate-200">Markdown (.md)</div>
                <div className="text-[10px] text-slate-500">Para Notion / Obsidian</div>
              </div>
            </button>

            <button
              onClick={handleDownloadCSV}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-amber-500 dark:hover:border-amber-500 bg-white dark:bg-slate-900 flex flex-col items-center gap-2 text-center transition-all group"
            >
              <Table className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
              <div>
                <div className="font-bold text-xs text-slate-800 dark:text-slate-200">Planilha CSV</div>
                <div className="text-[10px] text-slate-500">Para Excel / Sheets</div>
              </div>
            </button>
          </div>

          <button
            onClick={handleCopiarMarkdown}
            className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5 transition-colors"
          >
            {copiado ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copiado ? 'Markdown Copiado para Área de Transferência!' : 'Copiar Acervo em Markdown'}
          </button>
        </div>

        {/* Opção de Importação */}
        <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Importar / Restaurar Backup
          </h4>
          <input
            type="file"
            ref={fileInputRef}
            accept=".json"
            onChange={handleArquivoSelecionado}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full p-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-amber-500 dark:hover:border-amber-500 flex items-center justify-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors bg-slate-50/50 dark:bg-slate-900/50"
          >
            <Upload className="w-4 h-4 text-amber-600" />
            Selecionar arquivo JSON para restaurar estado
          </button>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
