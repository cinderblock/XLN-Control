@echo off
title "Dev Environment Starter"

echo "Starting hot server..."
start call "Hot Server.bat"
echo "Started"

echo.

echo "Giving hot server some time to start"
sleep 5

echo.

echo "Starting hot client..."
start call "Hot Client.bat"
echo "Started"

REM Just in case
sleep 5
