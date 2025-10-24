# Fix Import Assertions Script
# This script automatically fixes deprecated 'assert' syntax to 'with' syntax
# in @bitauth/libauth package for Node.js 22+ compatibility

Write-Host "Fixing import assertions in @bitauth/libauth..." -ForegroundColor Yellow

# Find all JavaScript files in the libauth package
$files = Get-ChildItem -Path "node_modules/@bitauth/libauth" -Recurse -Filter "*.js" -ErrorAction SilentlyContinue

if ($files.Count -eq 0) {
    Write-Host "@bitauth/libauth package not found. Make sure you've run 'yarn install' first." -ForegroundColor Red
    exit 1
}

$fixedFiles = 0
$totalReplacements = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Replace assert with with syntax
    $content = $content -replace 'assert \{ type: ''json'' \}', 'with { type: ''json'' }'
    
    # Count replacements
    $replacements = ([regex]::Matches($originalContent, 'assert \{ type: ''json'' \}')).Count
    
    if ($replacements -gt 0) {
        Set-Content $file.FullName $content
        $fixedFiles++
        $totalReplacements += $replacements
        Write-Host "Fixed $replacements assertion(s) in: $($file.Name)" -ForegroundColor Green
    }
}

if ($fixedFiles -gt 0) {
    Write-Host "Successfully fixed $totalReplacements import assertion(s) in $fixedFiles file(s)" -ForegroundColor Green
    Write-Host "Note: This fix will be lost when you run 'yarn install' again." -ForegroundColor Yellow
    Write-Host "Consider reporting this issue to @bitauth/libauth maintainers." -ForegroundColor Cyan
} else {
    Write-Host "No import assertions found to fix." -ForegroundColor Blue
}

Write-Host "You can now run 'npm run dev' or 'yarn dev'" -ForegroundColor Green