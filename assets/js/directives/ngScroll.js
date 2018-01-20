/**
 * @name ng-scrollbar
 * @author angrytoro
 * @since 9/12/2014
 * @version 0.1
 * @beta 0.2
 * @see https://github.com/angrytoro/ngscrollbar
 * @copyright 2014 angrytoro
 * @license MIT: You are free to use and modify this code, on the condition that this copyright notice remains.
 *
 * @description The angular directive ng-scrollbar imitate the true browser scrollbar.
 * It's applied to the element which set height or width attribute and the overflow is auto, but exclude body element.
 * It's not necessary to imitate scrollbar for body element, if you use the AngularJS.
 * suggests: don't use the directive, if you don't have to. The scrollbar which is inbuilt in browser is more highly-efficient.
 * AngularJS is not fit for IE which version is less then 9, so the directive is not fit the IE(8,7,6,5).
 *
 *
 * @example
 * <div ng-scroll scrollbar-x="false" scrollbar-y="true" scroll-config="{ overlay: true, autoResize: true, size: 'small', dragSpeed: 1.2 }">
 *     <div>Any Content</div>
 * </div>
 *
 * @conf spec
 * scrollbar-x the value is true or false, to configure the x scrollbar create or no create, the default value is true. but the directive can decide whether it need be created if user not set the attribute.
 *
 * scrollbar-y the value is true or false, to configure the y scrollbar create or no create, the default value is true. but the directive can decide whether it need be created if user not set the attribute.
 *
 * scroll-config
 * default config is
 *
 * {
 *      dragSpeed: 1, //default browser delta value is 120 or -120
        autoResize: false, // if need auto resize, default false
        overlay: false, // if need show when mouse not enter the container element which need scrollbar, default false.
        size: 'small' //enum : 'small', 'medium', 'large'
 * }
 *
 */

angular.module('GMAO Tailor').directive('ngScroll', [
    function() {
        return {
            restrict: 'AE',
            transclude: true,
            scope: {
                scrollConfig: '=',
                scrollbarX: '@', // the value is true or false, to configure the x scrollbar create or no create.
                scrollbarY: '@' // the value is true or false, to configure the y scrollbar create or no create.
            },
            template: '<div class="ngscroll" ng-class="{ \'ngscroll-overlay\': config.overlay, \'small\': config.size === \'small\', \'medium\': config.size === \'medium\', \'large\': config.size === \'large\' }">' +
                            '<div class="ngscroll-content-container" ng-transclude>' +
                            '</div>' +
                            '<ng-scrollbar scrollbar-axis="x" ng-if="scrollbarX || scrollbarX === undefined"></ng-scrollbar>' +
                            '<ng-scrollbar scrollbar-axis="y" ng-if="scrollbarY || scrollbarY === undefined"></ng-scrollbar>' +
                            '<div class="ng-scrollbar-filler" ng-hide="(scrollbarX || scrollbarX === undefined) && (scrollbarY || scrollbarY === undefined)"></div>' +
                       '</div>',
            controller: function() {
                //nothing to do
            },
            compile: function(element) {
                element.css('overflow', 'hidden');
                return function(scope, element, attrs, ctrl) {

                    var defaultConfig = {
                        dragSpeed: 1, //default browser delta value is 120 or -120
                        autoResize: false, // if need auto resize, default false
                        overlay: false, // if need show when mouse not enter the container element which need scrollbar, default false.
                        size: 'small'
                    };

                    ctrl.config = angular.copy(angular.extend(defaultConfig, scope.scrollConfig || {}));
                    scope.config = ctrl.config;

                    scope.$watch('scrollConfig', function(newValue, oldValue, scope) {
                        ctrl.config = angular.extend(defaultConfig, newValue || {});
                        scope.config = ctrl.config;
                    });

                    ctrl.containerElement = element;
                    ctrl.contentElement = angular.element(element[0].querySelector('.ngscroll-content-container'));
                };
            }
        };
    }
])
.directive('ngScrollbar', [ '$timeout', function($timeout) {
    return {
        restrict: 'AE',
        replace: true,
        require: '^?ngScroll',
        scope: {
          'scrollbarAxis': '@'
        },
        template: '<div class="ngscrollbar-container ngscrollbar-container-{{scrollbarAxis}}"><div class="ngscrollbar"></div></div>',
        compile: function() {
            return function(scope, element, attrs, ctrl) {

                var docEl = angular.element(document),
                    side = (scope.scrollbarAxis === 'x') ? { name: 'width', offsetName: 'offsetWidth', screenAxis: 'screenX', direction: 'left', margin: 'margin-left' } : { name: 'height', offsetName: 'offsetHeight', screenAxis: 'screenY', direction: 'top', margin: 'margin-top' },
                    scrollbar = angular.element(element[0].querySelector('.ngscrollbar'));

                function getContentOffset() {
                    //console.log('getContentOffset', ctrl.contentElement[0][side.offsetName]);
                    return ctrl.contentElement[0][side.offsetName];
                }

                function getContainerOffset() {
                    //console.log('getContainerOffset', ctrl.containerElement[0][side.offsetName]);
                    return ctrl.containerElement[0][side.offsetName];
                }


                function reset() {
                    var oldMargin = parseInt(ctrl.contentElement.css(side.margin), 10);
                    ctrl.contentElement.css(side.margin, '0px');
                    if (getContentOffset() > getContainerOffset()) { //if is overflow
                        element.css('display', 'block');
                        scrollbar.css(side.name, Math.pow(getContainerOffset(), 2) / getContentOffset() + 'px'); //scrollbar offset
                        scrollTo(oldMargin);
                    } else {
                        element.css('display', 'none');
                    }
                }

                function scrollTo(offset) {
                    offset = Math.min(0, Math.max(offset, getContainerOffset() - getContentOffset()));
                    ctrl.contentElement.css(side.margin, offset + 'px');
                    scrollbar.css(side.direction, -offset / getContentOffset() * getContainerOffset() + 'px');
                }

                function scroll(distance) {
                    var offset = parseInt(ctrl.contentElement.css(side.margin), 10) + distance;
                    scrollTo(offset);
                }


                var offset,
                    scrollbarMousedown = false;

                scrollbar.on('mousedown', function(event) {
                    event.preventDefault();
                    scrollbarMousedown = true;
                    offset = event[side.screenAxis];
                    docEl.one('mouseup', function() {
                        scrollbarMousedown = false;
                    });
                });

                docEl.on('mousemove', function(event) {
                    if (scrollbarMousedown) {
                        event.preventDefault();
                        scroll(-(event[side.screenAxis] - offset) * ctrl.config.dragSpeed * getContentOffset() / getContainerOffset());
                        offset = event[side.screenAxis];
                    }
                });

                $timeout(function() {
                    reset();
                    if (!!document.createStyleSheet) { //if the browser is ie browser
                        ctrl.contentElement.on('DOMNodeInserted', reset);
                        ctrl.contentElement.on('DOMNodeRemoved', reset);
                    } else {
                        var observer = new MutationObserver(function(mutations) {
                            if (mutations.length) {
                                reset();
                            }
                        });
                        observer.observe(ctrl.contentElement[0], { childList: true, subtree: true });
                    }
                }, 5);

                // Redraw the scrollbar when window size changes.
                if (ctrl.config.autoResize) {
                    // Closure to guard against leaking variables.
                    (function() {
                        var redrawTimer;

                        angular.element(window).on('resize', function(e) {
                            if (redrawTimer) {
                                clearTimeout(redrawTimer);
                            }
                            redrawTimer = setTimeout(function() {
                                redrawTimer = null;
                                reset();
                            }, 50);
                        });
                    })();
                }


                /* Only for the vertical scrollbar */
                if (scope.scrollbarAxis === 'y') {
                    ctrl.containerElement.on('mousewheel', function(event) {
                        if (getContentOffset() <= getContainerOffset()) { //if is not overflow
                            return;
                        }
                        event.preventDefault();
                        if (event.originalEvent !== undefined) {
                            event = event.originalEvent;
                        }
                        scroll(event.wheelDeltaY || event.wheelDelta);
                    });

                    if (window.navigator.userAgent.toLowerCase().indexOf('firefox') >= 0) {
                        ctrl.containerElement.on('wheel', function(event) {
                            if (getContentOffset() <= getContainerOffset()) { //if is not overflow
                                return;
                            }
                            event.preventDefault();
                            if (event.originalEvent !== undefined) {
                                event = event.originalEvent;
                            }
                            scroll(-event.deltaY * 40);// the ff delta value is 3 or -3 when scroll and the chrome or ie is -120 or 120, so it must multiply by 40
                        });
                    }
                }

            };
        }
    };
}]);
