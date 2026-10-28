document.addEventListener('DOMContentLoaded', () => {
  // Setup Edit Modal data population for User Panel
  const editModal = document.getElementById('editTodoModal');
  if (editModal) {
    editModal.addEventListener('show.bs.modal', (event) => {
      const button = event.relatedTarget;
      const id = button.getAttribute('data-id');
      const title = button.getAttribute('data-title');
      const description = button.getAttribute('data-description');
      const status = button.getAttribute('data-status');
      const priority = button.getAttribute('data-priority');
      const dueDate = button.getAttribute('data-duedate');

      const form = editModal.querySelector('#editTodoForm');
      form.action = `/todos/${id}/update`;

      editModal.querySelector('#editTitle').value = title || '';
      editModal.querySelector('#editDescription').value = description || '';
      editModal.querySelector('#editStatus').value = status || 'pending';
      editModal.querySelector('#editPriority').value = priority || 'medium';
      editModal.querySelector('#editDueDate').value = dueDate || '';
    });
  }

  // Setup Admin Edit Modal data population
  const adminEditModal = document.getElementById('adminEditTodoModal');
  if (adminEditModal) {
    adminEditModal.addEventListener('show.bs.modal', (event) => {
      const button = event.relatedTarget;
      const id = button.getAttribute('data-id');
      const userId = button.getAttribute('data-userid');
      const title = button.getAttribute('data-title');
      const description = button.getAttribute('data-description');
      const status = button.getAttribute('data-status');
      const priority = button.getAttribute('data-priority');
      const dueDate = button.getAttribute('data-duedate');

      const form = adminEditModal.querySelector('#adminEditTodoForm');
      form.action = `/admin/todos/${id}/update`;

      adminEditModal.querySelector('#adminEditUserId').value = userId || '';
      adminEditModal.querySelector('#adminEditTitle').value = title || '';
      adminEditModal.querySelector('#adminEditDescription').value = description || '';
      adminEditModal.querySelector('#adminEditStatus').value = status || 'pending';
      adminEditModal.querySelector('#adminEditPriority').value = priority || 'medium';
      adminEditModal.querySelector('#adminEditDueDate').value = dueDate || '';
    });
  }
});
