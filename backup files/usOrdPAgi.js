<div class="pagination-area mt-15 mb-50">
<nav aria-label="Page navigation example">
    <ul class="pagination">
        <li class="page-item <%= currentPage === 1 ? 'disabled' : '' %>">
            <a class="page-link" <% if (currentPage> 1) { %>
                href="/ordePageUser?page=<%= currentPage - 1 %>"
                    <% } %>
                        aria-label="Previous">
                        <span aria-hidden="true">&laquo;</span>
            </a>
        </li>
        <% for (let i=1; i <=totalPages; i++) { %>
            <li class="page-item <%= i === currentPage ? 'active' : '' %>">
                <a class="page-link" href="/ordePageUser?page=<%= i %>">
                    <%= i %>
                </a>
            </li>
            <% } %>
                <li class="page-item <%= currentPage === totalPages ? 'disabled' : '' %>">
                    <a class="page-link" <% if (currentPage < totalPages) { %>
                        href="/ordePageUser?page=<%= currentPage + 1 %>"
                            <% } %>
                                aria-label="Next">
                                <span aria-hidden="true">&raquo;</span>
                    </a>
                </li>
    </ul>
</nav>





</div>