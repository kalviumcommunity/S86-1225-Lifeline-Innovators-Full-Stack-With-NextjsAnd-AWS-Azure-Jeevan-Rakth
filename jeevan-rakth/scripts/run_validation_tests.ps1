function PostJson($url,$json){
  try {
    $r = Invoke-RestMethod -Uri $url -Method Post -ContentType 'application/json' -Body $json
    $r | ConvertTo-Json -Depth 10
  } catch {
    if ($_.Exception.Response) {
      $sr = $_.Exception.Response.GetResponseStream()
      $reader = New-Object System.IO.StreamReader($sr)
      $body = $reader.ReadToEnd()
      Write-Output $body
    } else {
      Write-Output $_
    }
  }
}

Write-Output '--- Test 1: Invalid user ---'
PostJson 'http://localhost:3000/api/users' '{"name":"A","email":"bademail"}'
Write-Output ''
Write-Output '--- Test 2: Valid user ---'
PostJson 'http://localhost:3000/api/users' '{"name":"Valid User","email":"valid.user+12345@example.com"}'
Write-Output ''
Write-Output '--- Test 3: Invalid project (missing teamId) ---'
PostJson 'http://localhost:3000/api/projects' '{"name":"Proj","code":"P001","ownerId":1}'
Write-Output ''
Write-Output '--- Test 4: Invalid order (missing productId) ---'
PostJson 'http://localhost:3000/api/orders' '{"userId":1}'
Write-Output ''
Write-Output '--- Test 5: Invalid task (missing fields) ---'
PostJson 'http://localhost:3000/api/tasks' '{"title":""}'
