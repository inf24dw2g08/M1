/*
 * Exemplo de como criar um livro com ID personalizado via API
 * 
 * Você pode executar este script com Node.js ou usar como referência
 * para requisições em ferramentas como Postman, Insomnia, etc.
 */

// Usando fetch em um ambiente Node.js (requer node-fetch)
// npm install node-fetch
const fetch = require('node-fetch');

async function createBookWithCustomId() {
    const bookData = {
        id: "meu-id-personalizado-123", // ID personalizado
        title: "Livro com ID Personalizado",
        author: "Autor Exemplo",
        isbn: "1234567890",
        published_year: 2023,
        quantity: 5,
        available: true
    };

    try {
        const response = await fetch('http://localhost:3000/api/books', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookData)
        });

        const data = await response.json();
        
        if (response.ok) {
            console.log('Livro criado com sucesso!');
            console.log('Dados do livro:', data);
        } else {
            console.error('Erro ao criar livro:', data.message);
        }
    } catch (error) {
        console.error('Erro na requisição:', error.message);
    }
}

// Executar a função
createBookWithCustomId();

/*
 * Exemplo de curl para linha de comando:
 * 
 * curl -X POST http://localhost:3000/api/books \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "_id": "meu-id-personalizado-123",
 *     "title": "Livro com ID Personalizado",
 *     "author": "Autor Exemplo",
 *     "isbn": "1234567890",
 *     "published_year": 2023,
 *     "quantity": 5,
 *     "available": true
 *   }'
 */