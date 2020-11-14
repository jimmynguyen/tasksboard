const path = '/lists';
const path_with_id = path + '/:id';

const setup_lists_routes = (app,em) => {
  const get_url_log = 'GET ' + path;
  console.log(get_url_log);
  app.get(path,(req,res) => {
    console.log(get_url_log);
    res.send(em.database.lists);
  });

  const put_url_log = 'PUT ' + path_with_id;
  console.log(put_url_log);
  app.put(path_with_id,(req,res) => {
    const list = {
      id: parseInt(req.params.id),
      name: req.body.name,
      order: parseInt(req.body.order),
      task_ids: []
    };
    const board_id = parseInt(req.body.board_id);
    console.log(put_url_log.replace(':id',list.id));
    em.addList(list,board_id);
    res.status(200).send();
  });

  const delete_url_log = 'DELETE ' + path_with_id;
  console.log(delete_url_log);
  app.delete(path_with_id,(req,res) => {
    const id = parseInt(req.params.id);
    console.log(delete_url_log.replace(':id',id))
    em.deleteList(id,false,true);
    res.status(200).send();
  });
};

module.exports = setup_lists_routes;