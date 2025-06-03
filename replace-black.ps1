# Skrypt PowerShell do zastąpienia wystąpień "black" i "#000000" zmienną --black
$files = Get-ChildItem -Path "src" -Recurse -Include "*.scss"

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    
    # Zastąp "black" i "#000000" zmienną --black
    $newContent = $content -replace "background-color:\s*black", "background-color: var(--black)" `
                          -replace "border:\s*([^;]*)\s+black", "border: `$1 var(--black)" `
                          -replace "box-shadow:\s*([^;]*)\s+#000000", "box-shadow: `$1 var(--black)" `
                          -replace "color:\s*#000000", "color: var(--black)" `
                          -replace "border:\s*([^;]*)\s+#000000", "border: `$1 var(--black)" `
                          -replace "background-color:\s*black;", "background-color: var(--black);"
    
    # Zapisz zmiany do pliku
    Set-Content -Path $file.FullName -Value $newContent
}

Write-Host "Zastąpiono wszystkie wystąpienia kolorów czarnych zmienną --black"
