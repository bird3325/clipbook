import { marked } from 'marked';
import { SummaryMode } from '../types';

export const saveAsPDF = async (title: string, content: string, mode: SummaryMode) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  // 마크다운을 HTML로 변환
  const renderedContent = await marked.parse(content);

  const getModeStyles = (m: SummaryMode) => {
    switch (m) {
      case SummaryMode.REPORT:
        return `
          :root { --primary: #1e40af; --accent: #3b82f6; --bg: #ffffff; }
          .header { border-left: 8px solid var(--primary); padding-left: 24px; border-bottom: none; }
          h2 { color: var(--primary); border-bottom: 1px solid var(--border); padding-bottom: 8px; }
          h2::before { display: none; }
          .content { counter-reset: section; }
          h2 { counter-increment: section; }
          h2::before { content: counter(section) ". "; margin-right: 8px; font-weight: 900; }
        `;
      case SummaryMode.EMAIL:
        return `
          :root { --primary: #0f172a; --accent: #64748b; --bg: #f8fafc; }
          body { background: var(--bg); padding: 40px auto; }
          .container { background: white; max-width: 700px; margin: 0 auto; padding: 50px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
          .header { text-align: center; border-bottom: 1px solid var(--border); margin-bottom: 40px; }
          .header h1 { font-size: 22pt; }
          .footer { background: #f1f5f9; margin: 40px -50px -50px -50px; padding: 30px; border-radius: 0 0 12px 12px; }
        `;
      case SummaryMode.CARD:
        return `
          :root { --primary: #7c3aed; --accent: #f472b6; --bg: #4c1d95; }
          body { background: var(--bg); color: white; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 0; }
          .container { width: 800px; height: 800px; background: linear-gradient(135deg, #4c1d95 0%, #1e1b4b 100%); padding: 80px; display: flex; flex-col; justify-content: center; position: relative; overflow: hidden; }
          .container::before { content: '"'; position: absolute; top: 40px; left: 60px; font-size: 150pt; opacity: 0.1; font-family: serif; }
          h1 { color: white; font-size: 32pt; text-align: center; margin-bottom: 50px; background: linear-gradient(to right, #fff, #ddd); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
          .content { font-size: 16pt; text-align: center; line-height: 1.5; }
          h2 { color: var(--accent); font-size: 20pt; justify-content: center; }
          h2::before { background: var(--accent); }
          .footer { border-top: 1px solid rgba(255,255,255,0.2); color: rgba(255,255,255,0.6); }
        `;
      default: // NOTION / DEFAULT
        return `
          :root { --primary: #000000; --accent: #666666; --bg: #ffffff; }
          body { font-family: 'Inter', system-ui, sans-serif; }
          h2 { font-size: 16pt; border-bottom: 1px solid #eee; padding-bottom: 4px; }
          blockquote { background: #f7f7f7; border-left: 3px solid #ddd; font-style: normal; }
        `;
    }
  };

  const html = `
    <html>
      <head>
        <title>${title}</title>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Noto+Sans+KR:wght@300;400;700;900&display=swap">
        <style>
          :root {
            --primary: #4f46e5;
            --text-main: #1f2937;
            --text-dim: #6b7280;
            --border: #e5e7eb;
            --bg-light: #f9fafb;
          }

          body { 
            font-family: 'Inter', 'Noto Sans KR', sans-serif; 
            padding: 2cm 2.5cm; 
            line-height: 1.7; 
            color: var(--text-main);
            background-color: white;
            word-break: keep-all;
            margin: 0;
          }

          @page { margin: 0; }

          .header {
            border-bottom: 3px solid var(--primary);
            padding-bottom: 24px;
            margin-bottom: 40px;
          }

          h1 { 
            font-size: 28pt; 
            font-weight: 900; 
            color: var(--text-main); 
            margin: 0;
            letter-spacing: -0.02em;
          }

          .meta {
            margin-top: 12px;
            font-size: 10pt;
            color: var(--text-dim);
            font-weight: 500;
          }

          .content { font-size: 11pt; }

          h2 { 
            font-size: 18pt; 
            font-weight: 700; 
            color: var(--text-main); 
            margin-top: 1.5em; 
            margin-bottom: 0.8em;
            display: flex;
            align-items: center;
          }
          
          h2::before {
            content: '';
            width: 4px;
            height: 1em;
            background: var(--primary);
            margin-right: 12px;
            border-radius: 2px;
          }

          h3 { font-size: 14pt; font-weight: 700; margin-top: 1.2em; margin-bottom: 0.6em; }
          p { margin-bottom: 1.2em; text-align: justify; }
          ul, ol { margin-bottom: 1.2em; padding-left: 1.5em; }
          li { margin-bottom: 0.5em; }

          blockquote {
            background: var(--bg-light);
            border-left: 4px solid var(--primary);
            margin: 1.5em 0;
            padding: 1em 1.5em;
            color: var(--text-dim);
            font-style: italic;
          }

          strong { font-weight: 700; color: var(--primary); }

          code {
            font-family: 'Courier New', Courier, monospace;
            background: var(--bg-light);
            padding: 0.2em 0.4em;
            border-radius: 4px;
            font-size: 90%;
            border: 1px solid var(--border);
          }

          hr { border: none; border-top: 1px solid var(--border); margin: 2.5em 0; }

          .footer { 
            margin-top: 60px; 
            font-size: 9pt; 
            color: var(--text-dim); 
            border-top: 1px solid var(--border); 
            padding-top: 20px; 
            text-align: center;
            font-weight: 500;
          }

          ${getModeStyles(mode)}

          @media print {
            body { padding: 1.5cm 2cm; }
            .container { box-shadow: none; border: none; width: 100%; height: auto; min-height: 100%; }
            h2 { page-break-after: avoid; }
            p, blockquote { orphans: 3; widows: 3; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${title}</h1>
            <div class="meta">ClipBook AI Researcher Report | ${mode} Edition</div>
          </div>
          <div class="content">
            ${renderedContent}
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} ClipBook AI. Generated at ${new Date().toLocaleString()}
          </div>
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();

  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };
};

