angular.module('app', ['flowchart','ui.tree'])
  .factory('prompt', function () {
    return prompt;
  })
  .config(function (NodeTemplatePathProvider) {
    NodeTemplatePathProvider.setTemplatePath("flowchart/node.html");
  })

  .controller('AppCtrl', function AppCtrl($scope, prompt, Modelfactory, flowchartConstants) {

    var deleteKeyCode = 46;
    var ctrlKeyCode = 17;
    var aKeyCode = 65;
    var escKeyCode = 27;
    var nextNodeID = 10;
    var nextConnectorID = 20;
    var ctrlDown = false;

    var model = {
      nodes: [
        {
          name: "Node 1",
          id: 2,
          x: 400,
          y: 100,
          color: '#000',
          borderColor: '#000',
          connectors: [
            {
              type: flowchartConstants.bottomConnectorType,
              id: 9
            },
            {
              type: flowchartConstants.bottomConnectorType,
              id: 10
            }
          ]
        },
        {
          name: "Node 2",
          id: 3,
          x: 400,
          y: 300,
          color: '#F15B26',
          connectors: [
            {
              type: flowchartConstants.topConnectorType,
              id: 1
            },
            {
              type: flowchartConstants.topConnectorType,
              id: 2
            },
            {
              type: flowchartConstants.topConnectorType,
              id: 3
            },
            {
              type: flowchartConstants.bottomConnectorType,
              id: 4
            },
            {
              type: flowchartConstants.bottomConnectorType,
              id: 5
            },
            {
              type: flowchartConstants.bottomConnectorType,
              id: 12
            }
          ]
        },
        {
          name: "Node 3",
          id: 4,
          x: 200,
          y: 600,
          color: '#000',
          borderColor: '#000',
          connectors: [
            {
              type: flowchartConstants.topConnectorType,
              id: 13
            },
            {
              type: flowchartConstants.topConnectorType,
              id: 14
            },
            {
              type: flowchartConstants.topConnectorType,
              id: 15
            }
          ]
        },
        {
          name: "Node 4",
          id: 5,
          x: 600,
          y: 600,
          color: '#000',
          borderColor: '#000',
          connectors: [
            {
              type: flowchartConstants.topConnectorType,
              id: 16
            },
            {
              type: flowchartConstants.topConnectorType,
              id: 17
            },
            {
              type: flowchartConstants.topConnectorType,
              id: 18
            }
          ]
        }
      ],
      edges: [
        {
          source: 10,
          destination: 1
        },
        {
          source: 5,
          destination: 14
        },
        {
          source: 5,
          destination: 17
        }
      ]
    };

    $scope.flowchartselected = [];
    var modelservice = Modelfactory(model, $scope.flowchartselected);

    $scope.model = model;
    $scope.modelservice = modelservice;

    $scope.keyDown = function (evt) {
      if (evt.keyCode === ctrlKeyCode) {
        ctrlDown = true;
        evt.stopPropagation();
        evt.preventDefault();
      }
    };

    $scope.keyUp = function (evt) {

      if (evt.keyCode === deleteKeyCode) {
        modelservice.deleteSelected();
      }

      if (evt.keyCode == aKeyCode && ctrlDown) {
        modelservice.selectAll();
      }

      if (evt.keyCode == escKeyCode) {
        modelservice.deselectAll();
      }

      if (evt.keyCode === ctrlKeyCode) {
        ctrlDown = false;
        evt.stopPropagation();
        evt.preventDefault();
      }
    };

    $scope.addNewNode = function () {
      var nodeName = prompt("Enter a node name:", "New node");
      if (!nodeName) {
        return;
      }

      var newNode = {
        name: nodeName,
        id: nextNodeID++,
        x: 200,
        y: 100,
        color: '#F15B26',
        connectors: [
          {
            id: nextConnectorID++,
            type: flowchartConstants.topConnectorType
          },
          {
            id: nextConnectorID++,
            type: flowchartConstants.topConnectorType
          },
          {
            id: nextConnectorID++,
            type: flowchartConstants.bottomConnectorType
          },
          {
            id: nextConnectorID++,
            type: flowchartConstants.bottomConnectorType
          }
        ]
      };

      model.nodes.push(newNode);
    };

    $scope.activateWorkflow = function () {
      angular.forEach($scope.model.edges, function (edge) {
        edge.active = !edge.active;
      });
    };

    $scope.addNewInputConnector = function () {
      var connectorName = prompt("Enter a connector name:", "New connector");
      if (!connectorName) {
        return;
      }

      var selectedNodes = modelservice.nodes.getSelectedNodes($scope.model);
      for (var i = 0; i < selectedNodes.length; ++i) {
        var node = selectedNodes[i];
        node.connectors.push({ id: nextConnectorID++, type: flowchartConstants.topConnectorType });
      }
    };

    $scope.addNewOutputConnector = function () {
      var connectorName = prompt("Enter a connector name:", "New connector");
      if (!connectorName) {
        return;
      }

      var selectedNodes = modelservice.nodes.getSelectedNodes($scope.model);
      for (var i = 0; i < selectedNodes.length; ++i) {
        var node = selectedNodes[i];
        node.connectors.push({ id: nextConnectorID++, type: flowchartConstants.bottomConnectorType });
      }
    };

    $scope.deleteSelected = function () {
      modelservice.deleteSelected();
    };

    $scope.callbacks = {
      edgeDoubleClick: function () {
        console.log('Edge double clicked.');
      },
      edgeMouseOver: function () {
        console.log('mouserover')
      },
      isValidEdge: function (source, destination) {
        return source.type === flowchartConstants.bottomConnectorType && destination.type === flowchartConstants.topConnectorType;
      },
      edgeAdded: function (edge) {
        console.log("edge added");
        console.log(edge);
      },
      nodeRemoved: function (node) {
        console.log("node removed");
        console.log(node);
      },
      edgeRemoved: function (edge) {
        console.log("edge removed");
        console.log(edge);
      },
      nodeCallbacks: {
        'doubleClick': function (event) {
          console.log('Node was doubleclicked.')
        }
      }
    };
    modelservice.registerCallbacks($scope.callbacks.edgeAdded, $scope.callbacks.nodeRemoved, $scope.callbacks.edgeRemoved);

    $scope.remove = function (scope) {
        scope.remove();
      };

      $scope.toggle = function (scope) {
        scope.toggle();
      };

      $scope.moveLastToTheBeginning = function () {
        var a = $scope.data.pop();
        $scope.data.splice(0, 0, a);
      };

      $scope.newSubItem = function (scope) {
        var nodeData = scope.$modelValue;
        nodeData.nodes.push({
          id: nodeData.id * 10 + nodeData.nodes.length,
          title: nodeData.title + '.' + (nodeData.nodes.length + 1),
          nodes: []
        });
      };

      $scope.collapseAll = function () {
        $scope.$broadcast('angular-ui-tree:collapse-all');
      };

      $scope.expandAll = function () {
        $scope.$broadcast('angular-ui-tree:expand-all');
      };
      
   $scope.data = [{
        'id': 1,
        'title': 'node1',
        'nodes': [
          {
            'id': 11,
            'title': 'node1.1',
            'nodes': [
              {
                'id': 111,
                'title': 'node1.1.1',
                'nodes': []
              }
            ]
          },
          {
            'id': 12,
            'title': 'node1.2',
            'nodes': []
          }
        ]
      }, {
        'id': 2,
        'title': 'node2',
        'nodrop': true, // An arbitrary property to check in custom template for nodrop-enabled
        'nodes': [
          {
            'id': 21,
            'title': 'node2.1',
            'nodes': []
          },
          {
            'id': 22,
            'title': 'node2.2',
            'nodes': []
          }
        ]
      }, {
        'id': 3,
        'title': 'node3',
        'nodes': [
          {
            'id': 31,
            'title': 'node3.1',
            'nodes': []
          }
        ]
      }];
  });
