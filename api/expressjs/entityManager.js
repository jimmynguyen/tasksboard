const fs = require('fs');

class EntityManager {
  constructor(database_filename) {
    this.database_filename = database_filename;
    this.database = require(database_filename);
  }

  updateDatabase() {
    const json = JSON.stringify(this.database,null,2);
    fs.writeFile(this.database_filename, json, (err) => {
      if (err) {
          throw err;
      }
      console.log('updated ' + this.database_filename);
    });
  };

  removeItemFromArray(array,item) {
    const idx = array.indexOf(item);
    if (idx >= 0) {
      array.splice(idx,1);
    }
  }

  addOrUpdateTask(task,list_id) {
    const existingTask = this.database.tasks.filter(x => x.id === task.id)[0];
    if (existingTask) {
      existingTask.name = task.name;
      existingTask.order = task.order;
      existingTask.complete = task.complete;
    } else {
      this.database.tasks.push(task);
      const list = this.database.lists.filter(x => x.id === list_id)[0];
      if (list) {
        list.task_ids.push(task.id);
      }
    }
    this.updateDatabase();
  }

  deleteTask(task_id,skip_remove_from_list=true,save=false) {
    const task = this.database.tasks.filter(x => x.id === task_id)[0];
    if (task) {
      this.removeItemFromArray(this.database.tasks,task);
      if (!skip_remove_from_list) {
        const list = this.database.lists.filter(x => x.task_ids.includes(task_id))[0];
        if (list) {
          this.removeItemFromArray(list.task_ids,task_id);
        }
      }
      if (save) {
        this.updateDatabase();
      }
    }
  }

  addList(list,board_id) {
    this.database.lists.push(list);
    const board = this.database.boards.filter(x => x.id === board_id)[0];
    if (board) {
      board.list_ids.push(list.id);
    }
    this.updateDatabase();
  }

  deleteList(list_id,skip_remove_from_board=true,save=false) {
    const list = this.database.lists.filter(x => x.id === list_id)[0];
    if (list) {
      list.task_ids.forEach(this.deleteTask,this);
      this.removeItemFromArray(this.database.lists,list);
      if (!skip_remove_from_board) {
        const board = this.database.boards.filter(x => x.list_ids.includes(list_id))[0];
        if (board) {
          this.removeItemFromArray(board.list_ids,list_id);
        }
      }
      if (save) {
        this.updateDatabase();
      }
    }
  }

  addBoard(board) {
    this.database.boards.push(board);
    this.updateDatabase();
  }

  deleteBoard(board_id) {
    const board = this.database.boards.filter(x => x.id === board_id)[0];
    if (board) {
      board.list_ids.forEach(this.deleteList,this);
      this.removeItemFromArray(this.database.boards,board);
      this.updateDatabase();
    }
  }
}

module.exports = {EntityManager};