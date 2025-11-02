# Client credentials
$clientId = "h9uple668oa0ugv178noilbaopi3e3"
$clientSecret = "ty7w9Haim19xjn3qndl1x2xi0eggar"

# 1. Get OAuth token
$tokenBody = @{
    client_id = $clientId
    client_secret = $clientSecret
    grant_type = "client_credentials"
}

$tokenResponse = Invoke-RestMethod -Uri "https://id.twitch.tv/oauth2/token" -Method Post -Body $tokenBody

Write-Host "✅ Token alındı: $($tokenResponse.access_token)" -ForegroundColor Green

# 2. IGDB API request
$headers = @{
    "Client-ID" = $clientId
    "Authorization" = "Bearer $($tokenResponse.access_token)"
}

$query = "fields name, cover.url, platforms.name; search ""Cyberpunk""; limit 5;"

$games = Invoke-RestMethod -Uri "https://api.igdb.com/v4/games" -Method Post -Headers $headers -Body $query -ContentType "text/plain"

# 3. Sonuçları göster
$games | ForEach-Object {
    Write-Host "🎮 $($_.name)" -ForegroundColor Cyan
    if ($_.cover) {
        Write-Host "   Cover: https://images.igdb.com/igdb/image/upload/t_cover_big/$($_.cover.url)" -ForegroundColor Gray
    }
}