document.addEventListener('DOMContentLoaded', function() {
  // Elementos de navegação
  const navBooks = document.getElementById('nav-books');
  const navLoans = document.getElementById('nav-loans');
  const contentBooks = document.getElementById('content-books');
  const contentLoans = document.getElementById('content-loans');
  
  // Carregar livros quando a página for carregada
  fetchBooks();
  
  // Event listeners de navegação
  navBooks.addEventListener('click', function(e) {
    e.preventDefault();
    showBooks();
  });
  
  navLoans.addEventListener('click', function(e) {
    e.preventDefault();
    showLoans();
    fetchLoans();
  });

  // Busca de livros
  document.getElementById('btn-search').addEventListener('click', function() {
    fetchBooks(document.getElementById('search-book').value);
  });
  
  // Funções de navegação
  function showBooks() {
    contentBooks.classList.remove('d-none');
    contentLoans.classList.add('d-none');
    navBooks.classList.add('active');
    navLoans.classList.remove('active');
  }
  
  function showLoans() {
    contentBooks.classList.add('d-none');
    contentLoans.classList.remove('d-none');
    navBooks.classList.remove('active');
    navLoans.classList.add('active');
  }
});

// Função para buscar livros da API
function fetchBooks(searchTerm = '') {
  let url = 'http://localhost:3000/api/books';
  if (searchTerm) {
    url += `?title=${encodeURIComponent(searchTerm)}`;
  }
  
  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error('Erro ao buscar livros');
      }
      return response.json();
    })
    .then(books => {
      displayBooks(books);
    })
    .catch(error => {
      console.error('Erro:', error);
      document.getElementById('books-list').innerHTML = `
        <tr>
          <td colspan="6" class="text-center text-danger">
            Erro ao carregar livros: ${error.message}
          </td>
        </tr>
      `;
    });
}

// Função para buscar empréstimos da API
function fetchLoans() {
  fetch('http://localhost:3000/api/loans/user')
    .then(response => {
      if (!response.ok) {
        throw new Error('Erro ao buscar empréstimos');
      }
      return response.json();
    })
    .then(loans => {
      displayLoans(loans);
    })
    .catch(error => {
      console.error('Erro:', error);
      document.getElementById('loans-list').innerHTML = `
        <tr>
          <td colspan="6" class="text-center text-danger">
            Erro ao carregar empréstimos: ${error.message}
          </td>
        </tr>
      `;
    });
}

// Exibir livros na tabela
function displayBooks(books) {
  const booksTable = document.getElementById('books-list');
  
  if (!books || books.length === 0) {
    booksTable.innerHTML = `
      <tr>
        <td colspan="6" class="text-center">Nenhum livro encontrado</td>
      </tr>
    `;
    return;
  }
  
  booksTable.innerHTML = books.map(book => `
    <tr>
      <td>${book.id || '-'}</td>
      <td>${book.title || '-'}</td>
      <td>${book.author || '-'}</td>
      <td>${book.genre || '-'}</td>
      <td>
        <span class="badge ${book.available ? 'badge-available' : 'badge-unavailable'}">
          ${book.available ? 'Disponível' : 'Indisponível'}
        </span>
      </td>
      <td>
        <button class="btn btn-sm btn-info" onclick="viewBookDetails(${book.id})">Detalhes</button>
        ${book.available ? `<button class="btn btn-sm btn-success" onclick="borrowBook(${book.id})">Emprestar</button>` : ''}
      </td>
    </tr>
  `).join('');
}

// Exibir empréstimos na tabela
function displayLoans(loans) {
  const loansTable = document.getElementById('loans-list');
  
  if (!loans || loans.length === 0) {
    loansTable.innerHTML = `
      <tr>
        <td colspan="6" class="text-center">Nenhum empréstimo ativo</td>
      </tr>
    `;
    return;
  }
  
  loansTable.innerHTML = loans.map(loan => `
    <tr>
      <td>${loan.id || '-'}</td>
      <td>${loan.book_title || '-'}</td>
      <td>${formatDate(loan.loan_date)}</td>
      <td>${formatDate(loan.due_date)}</td>
      <td>
        <span class="badge badge-${loan.status || 'active'}">
          ${getStatusText(loan.status)}
        </span>
      </td>
      <td>
        ${loan.status === 'active' ? 
          `<button class="btn btn-sm btn-warning" onclick="returnBook(${loan.id})">Devolver</button>` : ''}
      </td>
    </tr>
  `).join('');
}

// Funções auxiliares
function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString();
}

function getStatusText(status) {
  switch(status) {
    case 'active': return 'Ativo';
    case 'returned': return 'Devolvido';
    case 'overdue': return 'Atrasado';
    default: return status || 'Desconhecido';
  }
}

// Funções para serem implementadas posteriormente
function viewBookDetails(id) {
  alert(`Detalhes do livro ${id}`);
}

function borrowBook(id) {
  if (confirm(`Deseja emprestar o livro ${id}?`)) {
    fetch('http://localhost:3000/api/loans', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ book_id: id })
    })
    .then(response => response.json())
    .then(data => {
      alert('Livro emprestado com sucesso!');
      fetchBooks(); // Atualizar lista de livros
    })
    .catch(error => {
      alert('Erro ao emprestar livro: ' + error.message);
    });
  }
}

function returnBook(id) {
  if (confirm(`Deseja devolver o empréstimo ${id}?`)) {
    fetch(`http://localhost:3000/api/loans/${id}/return`, {
      method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
      alert('Livro devolvido com sucesso!');
      fetchLoans(); // Atualizar lista de empréstimos
    })
    .catch(error => {
      alert('Erro ao devolver livro: ' + error.message);
    });
  }
}
