@echo off
echo ==========================================
echo        AI Client Reports - RAG Test
echo ==========================================
echo.

echo Testing RAG system functionality...
cd ai-whatsapp-reports-backend
npm run test-rag
cd ..

echo.
echo RAG test completed!
pause
