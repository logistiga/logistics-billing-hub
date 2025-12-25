<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'LogistiGa')</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .email-wrapper {
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
        }
        .header .subtitle {
            margin-top: 5px;
            opacity: 0.9;
            font-size: 14px;
        }
        .content {
            padding: 30px;
        }
        .btn {
            display: inline-block;
            padding: 12px 24px;
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            color: white !important;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
        }
        .btn:hover {
            opacity: 0.9;
        }
        .info-box {
            background-color: #f8fafc;
            border-left: 4px solid #3b82f6;
            padding: 15px;
            margin: 20px 0;
            border-radius: 0 6px 6px 0;
        }
        .info-box.warning {
            border-left-color: #f59e0b;
            background-color: #fffbeb;
        }
        .info-box.success {
            border-left-color: #10b981;
            background-color: #ecfdf5;
        }
        .table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        .table th, .table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }
        .table th {
            background-color: #f8fafc;
            font-weight: 600;
            color: #374151;
        }
        .amount {
            font-size: 24px;
            font-weight: bold;
            color: #1e40af;
        }
        .footer {
            background-color: #f8fafc;
            padding: 20px 30px;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
        }
        .footer a {
            color: #3b82f6;
            text-decoration: none;
        }
        .divider {
            border-top: 1px solid #e5e7eb;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="email-wrapper">
            <div class="header">
                <h1>LogistiGa</h1>
                <div class="subtitle">Solutions Logistiques Professionnelles</div>
            </div>
            <div class="content">
                @yield('content')
            </div>
            <div class="footer">
                <p>© {{ date('Y') }} LogistiGa. Tous droits réservés.</p>
                <p>
                    Cet email a été envoyé automatiquement. 
                    <a href="{{ config('app.frontend_url') }}">Accéder à la plateforme</a>
                </p>
            </div>
        </div>
    </div>
</body>
</html>
