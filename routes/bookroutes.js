// Na rota POST /books, modificar para:
router.post('/books', async (req, res) => {
    try {
        let bookData = req.body;
        
        // Se um ID personalizado for fornecido, usamos ele
        if (bookData._id) {
            // Verificamos se já existe um livro com esse ID
            const existingBook = await Book.findById(bookData._id);
            if (existingBook) {
                return res.status(400).json({ message: 'Já existe um livro com este ID' });
            }
        }
        
        const newBook = await Book.create(bookData);
        res.status(201).json(newBook);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Certifique-se que a rota GET por ID está correta:
router.get('/books/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Livro não encontrado' });
        }
        res.status(200).json(book);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});