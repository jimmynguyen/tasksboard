const path = '/boards';
const path_with_id = path + '/:id';

const setup_boards_routes = (app,em) => {
  const get_url_log = 'GET ' + path;
  console.log(get_url_log);
  app.get(path,(req,res) => {
    console.log(get_url_log);
    res.send(em.database.boards);
  });

  const put_url_log = 'PUT ' + path_with_id;
  console.log(put_url_log);
  app.put(path_with_id,(req,res) => {
    const board = {
      id: parseInt(req.params.id),
      name: req.body.name,
      order: parseInt(req.body.order),
      list_ids: []
    };
    console.log(put_url_log.replace(':id',board.id));
    em.addBoard(board);
    res.status(200).send();
  });

  const delete_url_log = 'DELETE ' + path_with_id;
  console.log(delete_url_log);
  app.delete(path_with_id,(req,res) => {
    const id = parseInt(req.params.id);
    console.log(delete_url_log.replace(':id',id))
    em.deleteBoard(id);
    res.status(200).send();
  });
};

module.exports = setup_boards_routes;