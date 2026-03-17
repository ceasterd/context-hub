# Fill in your details
$company   = "LMJ"
$publicKey = "4ThlGJ4zzANrnGfh"
$privateKey = "BMx48GDw6traehk2"
$clientId  = "22d83c85-b86b-4a48-b38d-642b5cc9f842"   # from developer.connectwise.com/ClientId

$token = [Convert]::ToBase64String(
    [Text.Encoding]::ASCII.GetBytes("${company}+${publicKey}:${privateKey}")
)


Invoke-WebRequest `
  -Uri "https://na.myconnectwise.net/v4_6_release/apis/3.0/swagger.json" `
  -Headers @{
      "clientid"      = $clientId
      "Authorization" = "Basic $token"
  } `
  -OutFile "cw-manage-swagger.json"



