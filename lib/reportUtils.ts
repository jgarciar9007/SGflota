import { CompanySettings } from "@/context/DataContext";

export const generateDocumentHtml = (
    title: string,
    companySettings: CompanySettings,
    contentHtml: string,
    styles: string = ""
) => {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <style>
        @page { size: A4; margin: 0; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; 
            padding: 40px; 
            background: white; 
            color: #1f2937; 
            -webkit-print-color-adjust: exact; 
        }
        .header { 
            display: flex; 
            justify-content: space-between; 
            align-items: flex-start; 
            margin-bottom: 40px; 
            border-bottom: 2px solid #e5e7eb; 
            padding-bottom: 20px; 
        }
        .header-left { 
            width: 30%; 
            display: flex;
            align-items: center;
        }
        .header-center { 
            width: 40%; 
            text-align: center; 
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .header-right { 
            width: 30%; 
            text-align: right; 
        }
        .company-logo { 
            max-height: 80px; 
            max-width: 100%; 
            object-fit: contain; 
        }
        .document-title { 
            font-size: 24px; 
            font-weight: 800; 
            color: #1f2937; 
            text-transform: uppercase; 
            letter-spacing: 1px; 
        }
        .company-info { 
            font-size: 12px; 
            color: #6b7280; 
            line-height: 1.4; 
        }
        .company-name { 
            font-size: 16px; 
            font-weight: 700; 
            color: #1f2937; 
            margin-bottom: 4px; 
        }
        .footer { 
            position: fixed; 
            bottom: 40px; 
            left: 40px; 
            right: 40px; 
            text-align: center; 
            font-size: 10px; 
            color: #9ca3af; 
            border-top: 1px solid #e5e7eb; 
            padding-top: 10px; 
        }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { text-align: left; padding: 10px; background: #f3f4f6; color: #374151; font-size: 12px; font-weight: 700; text-transform: uppercase; border-bottom: 2px solid #e5e7eb; }
        td { padding: 10px; border-bottom: 1px solid #e5e7eb; font-size: 12px; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .font-bold { font-weight: bold; }
        .section-title { font-size: 14px; font-weight: 700; color: #374151; margin-top: 20px; margin-bottom: 10px; text-transform: uppercase; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; }
        ${styles}
    </style>
</head>
<body>
    <div class="header">
        <div class="header-left">
            ${companySettings.logo ? `<img src="${companySettings.logo}" alt="Logo" class="company-logo">` : ''}
        </div>
        <div class="header-center">
            <div class="document-title">${title}</div>
        </div>
        <div class="header-right">
            <div class="company-name">${companySettings.name}</div>
            <div class="company-info">
                ${companySettings.address}<br>
                ${companySettings.phone}<br>
                ${companySettings.email}<br>
                NIF: ${companySettings.taxId}
            </div>
        </div>
    </div>

    ${contentHtml}

    <div class="footer">
        Generado el ${new Date().toLocaleString()} • ${companySettings.website || ''}
    </div>

    <script>window.onload = function() { window.print(); }</script>
</body>
</html>
    `;
};
