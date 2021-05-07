import Deliveries from '@/models/Deliveries.model';
import Products from '@/models/Products.model'

const find = async (req) => {
  // some vars
  let query = {};
  let limit = req.body.limit ? (req.body.limit > 100 ? 100 : parseInt(req.body.limit)) : 100;
  let skip = req.body.page ? ((Math.max(0, parseInt(req.body.page)) - 1) * limit) : 0;
  let sort = { _id: 1 }

  // if date provided, filter by date
  if (req.body.when) {
    query['when'] = {
      '$gte': req.body.when
    }
  };


  let totalResults = await Deliveries.find(query).countDocuments();

  if (totalResults < 1) {
    throw {
      code: 404,
      data: {
        message: `We couldn't find any delivery`
      }
    }
  }

  let deliveries = await Deliveries.find(query).skip(skip).sort(sort).limit(limit);

  return {
    totalResults: totalResults,
    deliveries
  }
}


const findWeight = async (req) => {
  // some vars
  let query = {};
  let limit = req.body.limit ? (req.body.limit > 100 ? 100 : parseInt(req.body.limit)) : 100;
  let skip = req.body.page ? ((Math.max(0, parseInt(req.body.page)) - 1) * limit) : 0;

  let sort = { _id: 1 }

  let from =  {}
  let to = {}
  // if date provided, filter by date
  if (req.body.dateFrom) {
    from =  {
      '$gte': req.body.dateFrom
    }
  }
  if (req.body.dateTo) {
    to = {
      '$lte': (new Date(req.body.dateTo).getTime() + 1000 * 86400 * 1)
    }
  }
   
  if (req.body.dateFrom || req.body.dateTo) {
    query['when'] = {... from, ... to}
  }

  let totalResults = await Products.find({'weight': { '$gte': req.body.weight }}, {_id: 1}, function(err, docs) {
  // Map the docs into an array of just the _ids
  var ids = docs.map(function(doc) { return doc._id; });
    query['products'] = {$in: ids};
    Deliveries.find(query, function(err, docs) {
        return docs;
    });
  }).countDocuments();

  if (totalResults < 1) {
    throw {
      code: 404,
      data: {
        message: `We couldn't find any delivery`
      }
    }
  }

  let deliveries = await Products.find({'weight': { '$gte': req.body.weight }}, {_id: 1}, function(err, docs) {
    // Map the docs into an array of just the _ids
    var ids = docs.map(function(doc) { return doc._id; });
      query['products'] = {$in: ids};
      Deliveries.find(query, function(err, docs) {
          return docs;
      });
    }).skip(skip).sort(sort).limit(limit);

  return {
    totalResults: totalResults,
    deliveries
  }
}

const create = async (req) => {
  try {
    await Deliveries.create(req.body);
  } catch (e) {
    throw {
      code: 400,
      data: {
        message: `An error has occurred trying to create the delivery:
          ${JSON.stringify(e, null, 2)}`
      }
    }
  }
}

const findOne = async (req) => {
  let delivery = await Deliveries.findOne({_id: req.body.id});
  if (!delivery) {
    throw {
      code: 404,
      data: {
        message: `We couldn't find a delivery with the sent ID`
      }
    }
  }
  return delivery;
}

export default {
  find,
  findWeight,
  create,
  findOne
}
