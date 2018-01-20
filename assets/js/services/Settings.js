angular.module('GMAO Tailor').factory('Settings', [ function() {

  return {

    Connection: {
      default: {
        strokeColor: '#55aab6',
        strokeWidth: 2
      },
      hover: {
        strokeColor: '#4e919a',
        strokeWidth: 4
      }
    },

    Connector: {
      styles: {
        external: {
          default: {
            fillColor: 'rgba(255,255,255,0)',
            strokeColor: '#222222'
          },
          multiple: {
            fillColor: 'rgba(255,255,255,0)',
            strokeColor: '#c057eb'
          }
        },
        internal: {
          available: {
            fillColor: '#5ad97d'
          }
        }
      },
      hover: {
        scale: 1.2
      },
      rotating: {
        spin: 4
      }
    },

    view: {
      zoom : {
        value: 0.85,
        pitch: 0.1
      },
      move: {
        pitch: 1
      }
    },

    keybindings: { //[ keybindings ] === [ [key] ]
      toggleSelectAll: [  [ 'control', 'A' ], [ 'A' ]  ],
      inverseSelection: [ [ 'shift', 'A' ], [ 'Q' ] ],
      copySelected: [  [ 'control', 'C' ], [ 'C' ]  ],
      pasteCopied: [  [ 'control', 'V' ], [ 'V' ]  ],
      move: [ [] ], //no need to press a key (move the view)
      select: [  [ 'control' ]  ],
      deselect: [  [ 'shift' ]  ],
      restoreZoom: [  [ 'tab' ]  ],
      plusZoom: [  [ '+' ]  ],
      minusZoom: [  [ '-' ]  ],
      center: [  [ 'space' ]  ], //view or selected
      centerView: [  [ 'control', 'space' ], [ 'enter' ]  ],
      deleteSelected: [  [ 'delete' ]  ],
      restoreInterface: [  [ 'escape' ]  ], //abort selection/deselection, deselect all, center on view, restore zoom, close context menu, ...
      moveUp: [  [ 'up' ]  ],
      moveDown: [  [ 'down' ]  ],
      moveLeft: [  [ 'left' ]  ],
      moveRight: [  [ 'right' ]  ]
    },

    Global: {
      selection: {
        strokeColor: '#447DF4',
        strokeWidth: 2,
        fillColor: 'rgba(68, 125, 244, 0.7)'
      },

      deselection: {
        strokeColor: '#447DF4',
        strokeWidth: 2,
        fillColor: 'rgba(250, 250, 250, 0.1)'
      }
    },

    Element: {
      default: {
        main: {
          background: {
            fillColor: '#fff'
          },
          property: {
            fontFamily: 'Calibri',
            fontWeight: 'normal',
            fontSize: 20
          }
        },
        header: {
          background: {
            fillColor: '#78CE88'
          },
          text: {
            fillColor: '#fff',
            fontFamily: 'Calibri',
            fontWeight: 'normal',
            fontSize: 20
          }
        }
      },
      selected: {
        main: {
          background: {
            fillColor: 'rgba(255, 255, 255, .65)'
          }
        },
        header: {
          background: {
            fillColor: 'rgba(121 ,207, 137, .65)'
          }
        }
      },
      required: {
        main: {
          property: {
            fontWeight: 'italic bold'
          }
        }
      }
    }

  };

}]);
