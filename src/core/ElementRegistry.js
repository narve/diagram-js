var diagramModule = require('../di').defaultModule;

var _ = require('lodash');

// required components
require('./EventBus');

/**
 * @class
 * 
 * A registry that keeps track of all shapes in the diagram.
 * 
 * @param {EventBus} events the event bus
 */
function ElementRegistry(events) {
  
  // mapping shape.id -> container
  var shapeMap = {};

  // mapping gfx.id -> container
  var graphicsMap = {};

  function addShape(shape, gfx) {
    if (!shape.id) {
      throw new Error('[shapes] shape has no id');
    }

    if (!gfx.id) {
      throw new Error('[shapes] graphics has no id');
    }

    if (graphicsMap[gfx.id]) {
      throw new Error('graphics with id ' + gfx.id + ' already registered');
    }

    if (shapeMap[shape.id]) {
      throw new Error('shape with id ' + shape.id + ' already added');
    }

    shapeMap[shape.id] = graphicsMap[gfx.id] = { shape: shape, gfx: gfx };
  }

  function removeShape(shape) {
    var gfx = getGraphicsByShape(shape);

    if(shape.parent) {
      for(var i = 0; i < shape.parent.children.length;i++) {
        if(shape.parent.children[i].id === shape.id) {
          shape.parent.children.splice(i, 1);
        }
      }
    }
   // delete shape.parent.children[];
    delete shapeMap[shape.id];
    delete graphicsMap[gfx.id];
  }

  /**
   * @method ElementRegistry#getShapeByGraphics
   */
  function getShapeByGraphics(gfx) {
    var id = _.isString(gfx) ? gfx : gfx.id;

    var container = graphicsMap[id];
    if (container) {
      return container.shape;
    }
  }

  /**
   * @method ElementRegistry#getShapeById
   */
  function getShapeById(id) {
    var container = shapeMap[id];
    if (container) {
      return container.shape;
    }
  }

  /**
   * @method ElementRegistry#getGraphicsByShape
   */
  function getGraphicsByShape(shape) {
    var id = _.isString(shape) ? shape : shape.id;

    var container = shapeMap[id];
    if (container) {
      return container.gfx;
    }
  }

  events.on('shape.added', function(event) {
    addShape(event.element, event.gfx);
  });

  events.on('connection.added', function(event) {
    addShape(event.element, event.gfx);
  });

  events.on('shape.removed', function(event) {
    removeShape(event.element);
  });

  events.on('connection.removed', function(event) {
    removeShape(event.element);
  });

  return {
    getGraphicsByShape: getGraphicsByShape,
    getShapeById: getShapeById,
    getShapeByGraphics: getShapeByGraphics
  };
}

diagramModule.type('elementRegistry', [ 'eventBus', ElementRegistry ]);

module.exports = ElementRegistry;