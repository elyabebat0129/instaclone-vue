<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>InstaClone API — Swagger UI</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui.css">
    <link rel="icon" type="image/png" href="https://unpkg.com/swagger-ui-dist@5.17.14/favicon-32x32.png" sizes="32x32">
    <style>
        body { margin: 0; background: #fafafa; }
        #swagger-ui { max-width: 1460px; margin: 0 auto; }
    </style>
</head>
<body>
<div id="swagger-ui"></div>
<script src="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui-bundle.js"></script>
<script src="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui-standalone-preset.js"></script>
<script>
    window.onload = () => {
        window.ui = SwaggerUIBundle({
            url: "{{ url('/docs/openapi.yaml') }}",
            dom_id: "#swagger-ui",
            deepLinking: true,
            presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
            layout: "StandaloneLayout",
            persistAuthorization: true,
        });
    };
</script>
</body>
</html>
