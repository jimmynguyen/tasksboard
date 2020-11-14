const hostUrl = 'http://localhost:3000';
const urls = {
  boards: hostUrl + '/boards',
  lists: hostUrl + '/lists',
  tasks: hostUrl + '/tasks'
};
const db = {
  boards: [],
  lists: [],
  tasks: [],
  next_board_id: -1,
  next_list_id: -1,
  next_task_id: -1
};

const clickTaskCheckbox = (task_id,list_id) => {
  const task = db.tasks.filter(x => x.id === task_id)[0];
  $.ajax({
    url: urls.tasks + '/' + task.id,
    type: 'PUT',
    data: {
      name: task.name,
      order: task.order,
      complete: !task.complete,
      list_id: list_id
    }
  }).then((res) => {
    task.complete = !task.complete;
  });
};

const addTask = (list_id,li_task_add_id,input_task_add_id) => {
  const name = $(input_task_add_id).val();
  if (name === '') {
    return;
  }

  const list = db.lists.filter(x => x.id === list_id)[0];

  const task = {
    id: db.next_task_id++,
    name: name,
    order: list.tasks ? 0 : Math.max(...list.tasks.map(x => x.order)) + 1,
    complete: false
  };

  $.ajax({
    url: urls.tasks + '/' + task.id,
    type: 'PUT',
    data: {
      name: task.name,
      order: task.order,
      complete: task.complete,
      list_id: list_id
    }
  }).then((res) => {
    $(li_task_add_id).before(buildTaskHTML(task,list.id));
    $(input_task_add_id).val('');

    list.tasks.push(task);
    db.tasks.push(task);
  });
};

const deleteTask = (task_id,list_id,li_task_id) => {
  $.ajax({
    url: urls.tasks + '/' + task_id,
    type: 'DELETE'
  }).then((res) => {
    const list = db.lists.filter(x => x.id === list_id)[0];
    const task = list.tasks.filter(x => x.id === task_id)[0];
    list.tasks.splice(list.tasks.indexOf(task),1);
    db.tasks.splice(db.tasks.indexOf(task),1);
    $(li_task_id).remove();
  });
};

const addList = (board_id,div_list_add_id,input_list_add_id) => {
  const name = $(input_list_add_id).val();
  if (name === '') {
    return;
  }

  const board = db.boards.filter(x => x.id === board_id)[0];

  const list = {
    id: db.next_list_id++,
    name: name,
    order: board.lists ? 0 : Math.max(...board.lists.map(x => x.order)) + 1,
    tasks: []
  };

  $.ajax({
    url: urls.lists + '/' + list.id,
    type: 'PUT',
    data: {
      name: list.name,
      order: list.order,
      board_id: board_id
    }
  }).then((res) => {
    $(div_list_add_id).before(buildListHTML(list,board_id));
    $(input_list_add_id).val('');

    board.lists.push(list);
    db.lists.push(list);
  });
};

const deleteList = (list_id,board_id,div_list_id) => {
  $.ajax({
    url: urls.lists + '/' + list_id,
    type: 'DELETE'
  }).then((res) => {
    const board = db.boards.filter(x => x.id === board_id)[0];
    const list = board.lists.filter(x => x.id === list_id)[0];
    for (const task in list.tasks) {
      db.tasks.splice(db.tasks.indexOf(task),1);
    }
    db.lists.splice(db.lists.indexOf(list),1);
    board.lists.splice(board.lists.indexOf(list),1);
    $(div_list_id).remove();
  });
};

const addBoard = (div_board_add_id,input_board_add_id) => {
  const name = $(input_board_add_id).val();
  if (name === '') {
    return;
  }

  const board = {
    id: db.next_board_id++,
    name: name,
    order: Math.max(...db.boards.map(x => x.order)) + 1,
    lists: []
  };

  $.ajax({
    url: urls.boards + '/' + board.id,
    type: 'PUT',
    data: {
      name: board.name,
      order: board.order
    }
  }).then((res) => {
    $(div_board_add_id).before(buildBoardHTML(board));
    $(input_board_add_id).val('');

    db.boards.push(board);
  });
};

const deleteBoard = (board_id,div_board_id) => {
  $.ajax({
    url: urls.boards + '/' + board_id,
    type: 'DELETE'
  }).then((res) => {
    const board = db.boards.filter(x => x.id === board_id)[0];
    db.boards.splice(db.boards.indexOf(board),1);
    $(div_board_id).remove();
  });
};

const buildTaskCheckboxHTML = (task,task_id,list_id) => {
  let checkbox_html = '<input type="checkbox" id="input-' + task_id + '" ';
  checkbox_html += 'onchange="clickTaskCheckbox(' + task.id + ',' + list_id + ')" ';
  checkbox_html += (task.complete ? 'checked>' : '>');
  return checkbox_html;
}

const buildTaskHTML = (task,list_id) => {
  const task_id = 'task-' + task.id;
  const li_task_id = 'li-' + task_id;
  let task_html = '<li id="' + li_task_id + '">';
  task_html += buildTaskCheckboxHTML(task,task_id,list_id);
  task_html += '<label for="input-' + task_id + '"> ' + task.name + '</label> ';
  task_html += '<button onclick="deleteTask(' + task.id + ',' + list_id + ',\'#' + li_task_id + '\')">delete task</button>';
  task_html += '</li>';
  return task_html;
};

const buildListHTML = (list,board_id) => {
  const div_list_id = 'list-' + list.id;
  let list_html = '<div id="' + div_list_id + '" class="list">';
  list_html += '<h2>' + list.name;
  list_html += ' <button onclick="deleteList(' + list.id + ',' + board_id + ',\'#' + div_list_id + '\')">delete list</button>';
  list_html += '</h2><ul>';
  for (const task of list.tasks) {
    db.tasks.push(task);
    list_html += buildTaskHTML(task,list.id);
  }
  const task_add_id = 'task-add-' + list.id;
  const li_task_add_id = 'li-' + task_add_id;
  const input_task_add_id = 'input-' + task_add_id;
  list_html += '<li id="' + li_task_add_id + '">';
  list_html += '<input type="text" id="' + input_task_add_id + '" placeholder="Task Name"/>';
  list_html += '<button onclick="addTask(' + list.id + ',\'#' + li_task_add_id + '\',\'#' + input_task_add_id + '\')">add task</button></li>';
  list_html += '</ul></div>';
  return list_html;
};

const buildBoardHTML = (board) => {
  const div_board_id = 'board-' + board.id;
  let board_html = '<div id="' + div_board_id + '">';
  board_html += '<h1>' + board.name;
  board_html += ' <button onclick="deleteBoard(' + board.id + ',\'#' + div_board_id + '\')">delete board</button>';
  board_html += '</h1>';
  for (const list of board.lists) {
    db.lists.push(list);
    board_html += buildListHTML(list,board.id);
  }
  const div_list_add_id = 'list-add-' + board.id;
  const input_list_add_id = 'input-list-add-' + board.id;
  board_html += '<div id="' + div_list_add_id + '" class="list"><h2>';
  board_html += '<input type="text" id="' + input_list_add_id + '" placeholder="List Name"/>';
  board_html += '<button onclick="addList(' + board.id + ',\'#' + div_list_add_id + '\',\'#' + input_list_add_id + '\')">add list</button>';
  board_html += '</h2></div></div>';
  return board_html;
};

const buildBoards = (boards,lists,tasks) => {
  for (const list of lists) {
    list.tasks = tasks.filter(x => list.task_ids.includes(x.id));
    delete list.task_ids;
  }
  for (const board of boards) {
    board.lists = lists.filter(x => board.list_ids.includes(x.id));
    delete board.list_ids;
  }
  return boards;
};

$(document).ready(() => {
  $.when(
    $.ajax(urls.boards),
    $.ajax(urls.lists),
    $.ajax(urls.tasks)
  ).then((res_boards,res_lists,res_tasks) => {
    var boards = buildBoards(res_boards[0],res_lists[0],res_tasks[0]);
    var html = '';
    for (const board of boards) {
      db.boards.push(board);
      html += buildBoardHTML(board);
    }
    const div_board_add_id = 'board-add';
    const input_board_add_id = 'input-board-add';
    html += '<div id="' + div_board_add_id + '"><h1>'
    html += '<input type="text" id="' + input_board_add_id + '" placeholder="Board Name"/>';
    html += '<button onclick="addBoard(\'#' + div_board_add_id + '\',\'#' + input_board_add_id + '\')">add board</button>';
    html += '</h1></div></div>';
    $('#app').append(html);
    db.next_board_id = Math.max(...db.boards.map(x => x.id)) + 1;
    db.next_list_id = Math.max(...db.lists.map(x => x.id)) + 1;
    db.next_task_id = Math.max(...db.tasks.map(x => x.id)) + 1;
  });
});