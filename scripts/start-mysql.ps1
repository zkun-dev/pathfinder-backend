# PathFinder MySQL 服务启动脚本 (Windows)

Write-Host "🔍 检查 MySQL 服务状态..." -ForegroundColor Cyan

# 尝试启动 MySQL80 服务
try {
    $service = Get-Service -Name "MySQL80" -ErrorAction SilentlyContinue
    if ($service) {
        if ($service.Status -eq 'Running') {
            Write-Host "✅ MySQL80 服务已在运行" -ForegroundColor Green
        } else {
            Write-Host "🔄 正在启动 MySQL80 服务..." -ForegroundColor Yellow
            Start-Service -Name "MySQL80"
            Start-Sleep -Seconds 2
            if ((Get-Service -Name "MySQL80").Status -eq 'Running') {
                Write-Host "✅ MySQL80 服务启动成功！" -ForegroundColor Green
            } else {
                Write-Host "❌ MySQL80 服务启动失败" -ForegroundColor Red
                Write-Host "   请以管理员身份运行此脚本" -ForegroundColor Yellow
            }
        }
    } else {
        # 尝试 MySQL 服务
        $service = Get-Service -Name "MySQL" -ErrorAction SilentlyContinue
        if ($service) {
            if ($service.Status -eq 'Running') {
                Write-Host "✅ MySQL 服务已在运行" -ForegroundColor Green
            } else {
                Write-Host "🔄 正在启动 MySQL 服务..." -ForegroundColor Yellow
                Start-Service -Name "MySQL"
                Start-Sleep -Seconds 2
                if ((Get-Service -Name "MySQL").Status -eq 'Running') {
                    Write-Host "✅ MySQL 服务启动成功！" -ForegroundColor Green
                } else {
                    Write-Host "❌ MySQL 服务启动失败" -ForegroundColor Red
                    Write-Host "   请以管理员身份运行此脚本" -ForegroundColor Yellow
                }
            }
        } else {
            Write-Host "⚠️  未找到 MySQL 服务" -ForegroundColor Yellow
            Write-Host "   请确保 MySQL 已安装" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "❌ 错误: $_" -ForegroundColor Red
    Write-Host "   请以管理员身份运行 PowerShell" -ForegroundColor Yellow
}

Write-Host "`n💡 提示：" -ForegroundColor Cyan
Write-Host "   如果服务启动失败，请：" -ForegroundColor White
Write-Host "   1. 以管理员身份运行 PowerShell" -ForegroundColor Gray
Write-Host "   2. 或在服务管理器中手动启动 MySQL 服务" -ForegroundColor Gray
