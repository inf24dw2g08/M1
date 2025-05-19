// Função para criar um livro
async function createBook(event) {
    if (event) event.preventDefault();
    
    const formData = new FormData(document.getElementById('bookForm'));
    const bookData = {};
    
    // Converter FormData para objeto
    formData.forEach((value, key) => {
        // Se for o campo ID e estiver vazio, não incluir
        if (key === '_id' && !value.trim()) return;
        
        bookData[key] = value;
    });
    
    try {
        const response = await fetch('/api/books', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookData)
        });
        
        if (response.ok) {
            const newBook = await response.json();
            alert(`Livro "${newBook.title}" criado com sucesso! ID: ${newBook._id}`);
            document.getElementById('bookForm').reset();
            loadBooks(); // Recarregar lista de livros se existir
        } else {
            const errorData = await response.json();
            alert('Erro: ' + errorData.message);
        }
    } catch (error) {
        alert('Erro ao criar livro: ' + error.message);
    }
}

// Adicionar event listener ao formulário
document.getElementById('bookForm').addEventListener('submit', createBook);

// Função para buscar um livro pelo ID
async function fetchBookById(bookId) {
    try {
        const response = await fetch(`/api/books/${bookId}`);
        
        if (!response.ok) {
            throw new Error('Livro não encontrado');
        }
        
        const book = await response.json();
        return book;
    } catch (error) {
        console.error('Erro ao buscar livro:', error);
        alert('Erro ao buscar livro: ' + error.message);
        return null;
    }
}

// Exemplo de uso:
// const bookId = localStorage.getItem('lastBookId');
// if (bookId) {
//     const book = await fetchBookById(bookId);
//     if (book) {
//         console.log('Livro encontrado:', book);
//         // Faz algo com o livro...
//     }
// }