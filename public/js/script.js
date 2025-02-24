document.addEventListener("DOMContentLoaded", () => {
    console.log("Page loaded");

     // Ensure the borrowed books container is hidden initially
     document.getElementById("borrowed-books-container").style.display = "none"; 
    
     // Debugging to check if the container is being hidden correctly
     console.log("Borrowed Books Container is hidden:", 
         document.getElementById("borrowed-books-container").style.display);

     // DOM Elements
     const registerForm = document.getElementById("register-form");
     const loginForm = document.getElementById("login-form");
     const showLoginLink = document.getElementById("show-login-link");
     const showRegisterLink = document.getElementById("show-register-link");
     const loginButton = document.getElementById("login-btn");
     const registerButton = document.getElementById("register-btn");
 
     // Show login form
     showLoginLink.addEventListener("click", (e) => {
         e.preventDefault();
         registerForm.style.display = "none";
         loginForm.style.display = "block";
     });
 
     // Show register form
     showRegisterLink.addEventListener("click", (e) => {
         e.preventDefault();
         loginForm.style.display = "none";
         registerForm.style.display = "block";
     });
 
     // Handle login
     loginButton.addEventListener("click", async (e) => {
         e.preventDefault();
         const email = document.getElementById("login-email").value;
         const password = document.getElementById("login-password").value;
 
         if (!email || !password) {
             alert("Please enter both email and password!");
             return;
         }
 
         try {
             const response = await fetch("/auth/login", {
                 method: "POST",
                 headers: getAuthHeaders(),
                 body: JSON.stringify({ email, password })
             });
 
             const data = await response.json();
 
             if (response.ok) {
                 localStorage.setItem("token", data.token);
                 localStorage.setItem("role", data.user.role); // Store role in localStorage
                 console.log(data.token,data.user.role)
                 alert("Login successful!");
                 window.location.reload(); // Ensures the dashboard loads fresh
             } else {
                 alert(data.message || "Login failed");
             }
         } catch (error) {
             console.error("Login error:", error);
             alert("An error occurred. Please try again.");
         }
     });
       
     
     
     // Function to show the appropriate dashboard based on role
     function showDashboard() {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");
    
        if (!token || !role) {
            console.log("No token found, redirecting to login...");
            return;
        }
    
        document.getElementById("auth-section").style.display = "none";
    
        if (role === "admin") {
            document.getElementById("admin-dashboard").style.display = "block";
            
        } else {
            document.getElementById("user-dashboard").style.display = "block";
            //fetchBooks();
            //fetchUserBorrows();
        }
    }
    

// Call showDashboard when the page loads if the user is logged in
if (localStorage.getItem("token")) {
    showDashboard();
}
 
     // Handle registration
     registerButton.addEventListener("click", async (e) => {
         e.preventDefault();
         const name = document.getElementById("reg-name").value;
         const email = document.getElementById("reg-email").value;
         const password = document.getElementById("reg-password").value;
 
         if (!name || !email || !password) {
             alert("Please fill in all fields!");
             return;
         }
 
         try {
             const response = await fetch("/auth/register", {
                 method: "POST",
                 headers: getAuthHeaders(),
                 body: JSON.stringify({ name, email, password })
             });
 
             const data = await response.json();
 
             if (response.ok) {
                 alert("Registration successful! You can now log in.");
                 registerForm.style.display = "none";
                 loginForm.style.display = "block";
             } else {
                 alert(data.message || "Registration failed");
             }
         } catch (error) {
             console.error("Registration error:", error);
             alert("An error occurred. Please try again.");
         }
     });

    const token = localStorage.getItem("token");
    if (token) {
        console.log("User is authenticated");
    } else {
        console.log("No token found, user not authenticated");
    }

    // Set global headers for authenticated requests
    function getAuthHeaders() {
        const token = localStorage.getItem("token");
        const headers = { "Content-Type": "application/json" }; // Always include Content-Type
    
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }
    
        return headers;
    }
    
    // Function to hide all book sections
function hideAllBookSections() {
    document.getElementById("available-books-container").style.display = "none";
    document.getElementById("borrowed-books-container").style.display = "none";
    document.getElementById("fines-container").style.display = "none"; 
}

// Function to scroll to a section smoothly
function scrollToSection(sectionId) {
    document.getElementById(sectionId).scrollIntoView({ behavior: "smooth" });
}
    
    // Fetch all books for users
    async function fetchBooks() {
        console.log("Fetching books with headers:", getAuthHeaders());
        try {
            const response = await fetch("/books", { headers: getAuthHeaders() });
            const data = await response.json();
            console.log("User Books Response:", response.status, data);
    
            if (response.ok) {
                const availableBooks = data.books.filter(book => book.status === "available");
                displayBooks(availableBooks);
                hideAllBookSections(); // Hide other sections
                document.getElementById("available-books-container").style.display = "block";
                scrollToSection("available-books-container"); // Smooth scroll
            } else {
                console.error("Error fetching books:", response.status, data.message);
            }
        } catch (error) {
            console.error("Error fetching books:", error);
        }
    }
    
    
       // Display available books in UI
       function displayBooks(books) {
        const bookList = document.getElementById("book-list");
        bookList.innerHTML = ""; // Clear previous list
    
        books.forEach(book => {
            const bookItem = document.createElement("div");
            bookItem.classList.add("book-item");
    
            bookItem.innerHTML = `
                <div class="book-details">
                    <h4>${book.title}</h4>
                    <p><strong>Author:</strong> ${book.author}</p>
                    <p><strong>Status:</strong> <span class="${book.status === 'available' ? 'status-available' : 'status-unavailable'}">${book.status}</span></p>
                </div>
            `;
    
            const actionsDiv = document.createElement("div");
            actionsDiv.classList.add("book-actions");
    
            // Borrow button
            if (book.status === "available") {
                const borrowButton = document.createElement("button");
                borrowButton.textContent = "Borrow";
                borrowButton.classList.add("borrow-btn");
                borrowButton.onclick = () => borrowBook(book._id);
                actionsDiv.appendChild(borrowButton);
            }
    
            // Return button (only show if the book is borrowed)
            if (book.status === "borrowed") {
                const returnButton = document.createElement("button");
                returnButton.textContent = "Return";
                returnButton.classList.add("return-btn");
                returnButton.onclick = () => returnBook(book._id);
                actionsDiv.appendChild(returnButton);
            }
    
            bookItem.appendChild(actionsDiv);
            bookList.appendChild(bookItem);
        });
    
        // Make sure the book-list container is visible
        document.getElementById("available-books-container").style.display = "block";
    }
    

    
// Function to borrow a book 
async function borrowBook(bookId) {
    try {
        const response = await fetch(`/borrow/borrow`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({ bookId }),
        });

        const data = await response.json();
        if (response.ok) {
            alert("Book borrowed successfully!");
            fetchBooks();  // Re-fetch available books to update the UI
            fetchUserBorrows(); // Re-fetch borrowed books to update user's list
        } else {
            alert(data.message || "Failed to borrow the book.");
        }
    } catch (error) {
        console.error("Error borrowing book:", error);
    }
}


    // Return a book function
async function returnBook(borrowId) {
    try {
        const response = await fetch("/borrow/return", {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({ borrowId })
        });

        const data = await response.json();
        if (response.ok) {
            alert(`Book returned successfully! Fine: $${data.fine}`);
            fetchUserBorrows(); // Refresh borrowed books
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error("Error returning book:", error);
    }
}
    // Renew a book
    async function renewBook(borrowId) {
        try {
            const response = await fetch("/borrow/renew", {
                method: "POST",
                headers:getAuthHeaders(),
                body: JSON.stringify({ borrowId })
            });
            const data = await response.json();
            if (response.ok) {
                alert("Book renewed successfully!");
                fetchUserBorrows();
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error("Error renewing book:", error);
        }
    }

    // Fetch borrowed books for the user
    async function fetchUserBorrows() {
        try {
            const response = await fetch("/borrow/my-borrows", {
                method: "GET",
                headers: getAuthHeaders()
            });
    
            const data = await response.json();
            if (response.ok) {
                const borrowedBooksContainer = document.getElementById("borrowed-books-container");
                const borrowedBooksList = document.getElementById("borrowed-books");
    
                borrowedBooksList.innerHTML = ""; // Clear previous list
                data.borrowedBooks.forEach(borrow => {
                      // Create a container div for each borrowed book
                const borrowedBookItem = document.createElement("div");
                borrowedBookItem.classList.add("borrowed-book-item");

                // Add book title and due date
                borrowedBookItem.innerHTML = `
                    <h4>${borrow.book.title}</h4>
                    <p>Due: ${new Date(borrow.dueDate).toLocaleDateString()}</p>
                `;

                // Create the actions container for buttons
                const actionsContainer = document.createElement("div");
                actionsContainer.classList.add("borrowed-book-actions");

    
                    const returnBtn = document.createElement("button");
                    returnBtn.textContent = "Return";
                    returnBtn.onclick = () => returnBook(borrow._id);
    
                    const renewBtn = document.createElement("button");
                    renewBtn.textContent = "Renew";
                    renewBtn.onclick = () => renewBook(borrow._id);
    
                    // Append buttons to the actions container
                actionsContainer.appendChild(returnBtn);
                actionsContainer.appendChild(renewBtn);

                // Append the actions container to the borrowed book item
                borrowedBookItem.appendChild(actionsContainer);

                // Append the borrowed book item to the main borrowed books container
                borrowedBooksList.appendChild(borrowedBookItem);
                });
    
                borrowedBooksContainer.style.display = "block";
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error("Error fetching borrowed books:", error);
        }
    }
    
    

    // Display borrowed books in UI
    function displayUserBorrows(borrowedBooks) {
        const borrowList = document.getElementById("borrowed-books");
        if (!borrowList) return;
        borrowList.innerHTML = "";
        borrowedBooks.forEach(borrow => {
            const borrowItem = document.createElement("li");
            borrowItem.innerHTML = `
                <strong>${borrow.book.title}</strong> - Due: ${new Date(borrow.dueDate).toDateString()}
                <button class="return-btn" data-id="${borrow._id}">Return</button>
                <button class="renew-btn" data-id="${borrow._id}">Renew</button>
            `;
            borrowList.appendChild(borrowItem);
        });

        document.querySelectorAll(".return-btn").forEach(button => {
            button.addEventListener("click", () => returnBook(button.dataset.id));
        });

        document.querySelectorAll(".renew-btn").forEach(button => {
            button.addEventListener("click", () => renewBook(button.dataset.id));
        });
    }

    // Admin: Fetch all books for management
    async function fetchAdminBooks() {
        try {
            console.log("Fetching admin books...");
            const response = await fetch("/admin/manage-books", { 
                method: "GET",
                headers: getAuthHeaders(),
            });
    
            const data = await response.json();
            console.log("Admin Books Response:", response.status, data);  
    
            if (response.ok) {
                const adminBooksSection = document.getElementById("admin-books-section");
                if (adminBooksSection) {
                    adminBooksSection.style.display = "block"; // Show books
                } else {
                    console.error("Element #admin-books-section not found!");
                }
    
                displayAdminBooks(data.books);
            } else {
                console.error("Error fetching admin books:", response.status, data.message);
            }
        } catch (error) {
            console.error("Error fetching admin books:", error);
        }
    }
    
    // Display books in admin panel
    function displayAdminBooks(books) {
        const adminBookList = document.getElementById("admin-book-list");
    
        console.log("Admin Book List Element:", adminBookList);
        if (!adminBookList) {
            console.error("Element #admin-book-list not found!");
            return;
        }
    
        adminBookList.innerHTML = ""; // Clear previous entries
    
        if (!books || !Array.isArray(books) || books.length === 0) {
            console.log("No books to display.");
            adminBookList.innerHTML = "<p>No books found.</p>";
            return;
        }
    
        books.forEach(book => {
            console.log("Processing book:", book);
            const bookItem = document.createElement("div");
            bookItem.classList.add("book-item"); 
    
            bookItem.innerHTML = `
                <p><strong>${book.title}</strong> by ${book.author} - <em>${book.status}</em></p>
                <button class="update-btn" data-id="${book._id}">Update</button>
            `;
    
            if (book._id) {
                bookItem.innerHTML += `<button class="delete-btn" data-id="${book._id}">Delete</button>`;
            } else {
                console.warn(`Book "${book.title}" is missing an ID, skipping delete button.`);
            }
    
            adminBookList.appendChild(bookItem);
        });
    
        const deleteButtons = document.querySelectorAll(".delete-btn");
        console.log(`Found ${deleteButtons.length} delete buttons.`);
        deleteButtons.forEach(button => {
            button.addEventListener("click", () => deleteBook(button.dataset.id));
        });

        // Add event listener for Update button click
    const updateButtons = document.querySelectorAll(".update-btn");
    updateButtons.forEach(button => {
        button.addEventListener("click", () => updateBook(button.dataset.id));
    });
    }
    

    // Admin: Add a new book
    async function addBook(title, author) {
        try {
            const response = await fetch("/books", {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({ title, author })
            });
            const data = await response.json();
            if (response.ok) {
                alert("Book added successfully!");
                fetchAdminBooks();
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error("Error adding book:", error);
        }
    }
    

    // Admin: Delete a book
    async function deleteBook(bookId) {
        try {
            const response = await fetch(`/books/${bookId}`, {
                method: "DELETE",
                headers :getAuthHeaders()
            });
            const data = await response.json();
            if (response.ok) {
                alert("Book deleted successfully!");
                fetchAdminBooks();
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error("Error deleting book:", error);
        }
    }

    // Fetch user fines
async function fetchUserFines() {
    try {
        const response = await fetch("/borrow/my-fines", {
            headers: getAuthHeaders(), // Include authorization headers
        });
        const data = await response.json();
        if (response.ok) {
            displayFines(data.fines);  // Call function to display fines
        } else {
            console.error("Error fetching fines:", data.message);
        }
    } catch (error) {
        console.error("Error fetching fines:", error);
    }
}

// Display fines in the UI
function displayFines(fines) {
    const finesList = document.getElementById("fines-list");
    const finesContainer = document.getElementById("fines-container");

    if (!finesList) return;

    finesList.innerHTML = "";
    if (fines.length === 0) {
        finesList.innerHTML = "<li>No fines found.</li>";
    } else {
        fines.forEach(fine => {
            const fineItem = document.createElement("li");
            fineItem.textContent = `Book: ${fine.book.title} - Fine: $${fine.fine}`;
            finesList.appendChild(fineItem);
        });
    }

    finesContainer.style.display = "block";  // Show the fines container
}

// Show fines when the "View Fines" button is clicked
document.getElementById("viewFines")?.addEventListener("click", () => {
    hideAllBookSections();
    document.getElementById("fines-container").style.display = "block";
    fetchUserFines(); // Fetch and display fines
    scrollToSection("fines-container");
});


    // Event listeners
    document.getElementById("add-book-form")?.addEventListener("submit", addBook);

    // User Dashboard Functions
document.getElementById("viewBooks")?.addEventListener("click", fetchBooks);

document.getElementById("viewCheckedOutBooks").addEventListener("click", () => {
    hideAllBookSections(); // Hide other sections
    document.getElementById("borrowed-books-container").style.display = "block"; // Show section
    fetchUserBorrows(); // Fetch and display borrowed books
    scrollToSection("borrowed-books-container"); // Smooth scroll
});

document.getElementById("borrowBook")?.addEventListener("click", () => {
    const bookId = prompt("Enter Book ID to Borrow:");
    if (bookId) borrowBook(bookId);
});

// Attach event listener to "Return Book" button
document.getElementById("viewCheckedOutBooks")?.addEventListener("click", fetchUserBorrows);

document.getElementById("renewBook")?.addEventListener("click", () => {
    const borrowId = prompt("Enter Borrow ID to Renew:");
    if (borrowId) renewBook(borrowId);
});


//logout event handler
document.addEventListener("click", (event) => {
    if (event.target.id === "logout") {
        console.log("Logout button clicked!"); // Should appear when clicked
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        alert("Logged out successfully!");
        window.location.reload();
    }
});




// Admin Dashboard Functions
document.getElementById("manageBooks")?.addEventListener("click", () => {
    console.log("Clicked Manage Books");
    fetchAdminBooks();
});

document.getElementById("createBook")?.addEventListener("click", () => {
    const title = prompt("Enter Book Title:");
    const author = prompt("Enter Book Author:");
    if (title && author) addBook(title, author);
});

// Handle book update
async function updateBook(bookId) {
    try {
        const newTitle = prompt("Enter new title for the book:");
        const newAuthor = prompt("Enter new author for the book:");

        if (newTitle && newAuthor) {
            const response = await fetch(`/books/${bookId}`, {
                method: "PATCH", // Changed from PUT to PATCH
                headers: {
                    "Content-Type": "application/json",
                    ...getAuthHeaders()
                },
                body: JSON.stringify({
                    title: newTitle,
                    author: newAuthor
                })
            });

            const data = await response.json();
            if (response.ok) {
                alert("Book updated successfully!");
                fetchAdminBooks(); // Refresh the list of books
            } else {
                alert("Error updating book: " + (data.message || "Unknown error"));
            }
        }
    } catch (error) {
        console.error("Error updating book:", error);
    }
}


    // Initial Fetch Calls
   // fetchBooks();
    //if (token) {
      //  fetchUserBorrows();
       
    //}
   
})