angular.module('GMAO Tailor').directive('avatar', function() {
  return {
    restrict: 'E',
    replace: true,
    scope: false,
    template:
      '<div class="avatar-container">' +
        '<img ng-src="{{avatarSrc}}" />' +
        '<md-button class="avatar-button md-error" ng-show="avatarSrc !== defaultSrc" ng-click="restoreAvatar()">' +
          '<i class="fa fa-refresh" aria-hidden="true"></i>' +
          '<span>Avatar</span>' +
        '</md-button>' +
        '<div ng-show="avatarSrc === defaultSrc">' +
          '<input id="input-avatar" type="file" accept="image/*">' +
          '<label for="input-avatar" class="avatar-button md-button md-raised md-primary">' +
            '<i class="fa fa-upload" aria-hidden="true"></i>' +
            '<span>Avatar</span>' +
          '</label>' +
        '</div>' +
      '</div>',
    controller: [ '$scope', '$q', '$http', 'Toast', function($scope, $q, $http, Toast) {

      $scope.restoreAvatar = function() {
        $scope.avatarSrc = $scope.defaultSrc.slice();
      };

      var inputAvatar =  document.getElementById('input-avatar');
      $scope.restoreAvatar(); //init

      // scales the image by (float) scale < 1
      // returns a canvas containing the scaled image.
      function downScaleImage(img, size) {
          var imgCV = document.createElement('canvas');
          imgCV.width = img.width;
          imgCV.height = img.height;
          var imgCtx = imgCV.getContext('2d');
          imgCtx.drawImage(img, 0, 0);
          return downScaleCanvas(imgCV, size);
      }

      // scales the canvas by (float) scale < 1
      // returns a new canvas containing the scaled image.
      function downScaleCanvas(cv, size) {
          var xScale = size / cv.width;
          var yScale = size / cv.height;
          var sqScale = xScale * yScale; // square scale = area of source pixel within target
          var sw = cv.width; // source image width
          var sh = cv.height; // source image height
          var tw = size; // target image width
          var th = size; // target image height
          var sx = 0, sy = 0, sIndex = 0; // source x,y, index within source array
          var tx = 0, ty = 0, yIndex = 0, tIndex = 0; // target x,y, x,y index within target array
          var tX = 0, tY = 0; // rounded tx, ty
          var w = 0, nw = 0, wx = 0, nwx = 0, wy = 0, nwy = 0; // weight / next weight x / y
          // weight is weight of current source point within target.
          // next weight is weight of current source point within next target's point.
          var crossX = false; // does scaled px cross its current px right border ?
          var crossY = false; // does scaled px cross its current px bottom border ?
          var sBuffer = cv.getContext('2d').
          getImageData(0, 0, sw, sh).data; // source buffer 8 bit rgba
          var tBuffer = new Float32Array(3 * tw * th); // target buffer Float32 rgb
          var sR = 0, sG = 0,  sB = 0; // source's current point r,g,b
          /* untested !
          var sA = 0;  //source alpha  */

          for (sy = 0; sy < sh; sy++) {
              ty = sy * yScale; // y src position within target
              tY = 0 | ty;     // rounded : target pixel's y
              yIndex = 3 * tY * tw;  // line index within target array
              crossY = (tY != (0 | ty + yScale));
              if (crossY) { // if pixel is crossing bottom target pixel
                  wy = (tY + 1 - ty); // weight of point within target pixel
                  nwy = (ty + yScale - tY - 1); // ... within y+1 target pixel
              }
              for (sx = 0; sx < sw; sx++, sIndex += 4) {
                  tx = sx * xScale; // x src position within target
                  tX = 0 | tx;    // rounded : target pixel's x
                  tIndex = yIndex + tX * 3; // target pixel index within target array
                  crossX = (tX != (0 | tx + xScale));
                  if (crossX) { // if pixel is crossing target pixel's right
                      wx = (tX + 1 - tx); // weight of point within target pixel
                      nwx = (tx + xScale - tX - 1); // ... within x+1 target pixel
                  }
                  sR = sBuffer[sIndex    ];   // retrieving r,g,b for curr src px.
                  sG = sBuffer[sIndex + 1];
                  sB = sBuffer[sIndex + 2];

                  /* !! untested : handling alpha !!
                     sA = sBuffer[sIndex + 3];
                     if (!sA) continue;
                     if (sA != 0xFF) {
                         sR = (sR * sA) >> 8;  // or use /256 instead ??
                         sG = (sG * sA) >> 8;
                         sB = (sB * sA) >> 8;
                     }
                  */
                  if (!crossX && !crossY) { // pixel does not cross
                      // just add components weighted by squared scale.
                      tBuffer[tIndex    ] += sR * sqScale;
                      tBuffer[tIndex + 1] += sG * sqScale;
                      tBuffer[tIndex + 2] += sB * sqScale;
                  } else if (crossX && !crossY) { // cross on X only
                      w = wx * yScale;
                      // add weighted component for current px
                      tBuffer[tIndex    ] += sR * w;
                      tBuffer[tIndex + 1] += sG * w;
                      tBuffer[tIndex + 2] += sB * w;
                      // add weighted component for next (tX+1) px
                      nw = nwx * yScale;
                      tBuffer[tIndex + 3] += sR * nw;
                      tBuffer[tIndex + 4] += sG * nw;
                      tBuffer[tIndex + 5] += sB * nw;
                  } else if (crossY && !crossX) { // cross on Y only
                      w = wy * xScale;
                      // add weighted component for current px
                      tBuffer[tIndex    ] += sR * w;
                      tBuffer[tIndex + 1] += sG * w;
                      tBuffer[tIndex + 2] += sB * w;
                      // add weighted component for next (tY+1) px
                      nw = nwy * xScale;
                      tBuffer[tIndex + 3 * tw    ] += sR * nw;
                      tBuffer[tIndex + 3 * tw + 1] += sG * nw;
                      tBuffer[tIndex + 3 * tw + 2] += sB * nw;
                  } else { // crosses both x and y : four target points involved
                      // add weighted component for current px
                      w = wx * wy;
                      tBuffer[tIndex    ] += sR * w;
                      tBuffer[tIndex + 1] += sG * w;
                      tBuffer[tIndex + 2] += sB * w;
                      // for tX + 1; tY px
                      nw = nwx * wy;
                      tBuffer[tIndex + 3] += sR * nw;
                      tBuffer[tIndex + 4] += sG * nw;
                      tBuffer[tIndex + 5] += sB * nw;
                      // for tX ; tY + 1 px
                      nw = wx * nwy;
                      tBuffer[tIndex + 3 * tw    ] += sR * nw;
                      tBuffer[tIndex + 3 * tw + 1] += sG * nw;
                      tBuffer[tIndex + 3 * tw + 2] += sB * nw;
                      // for tX + 1 ; tY +1 px
                      nw = nwx * nwy;
                      tBuffer[tIndex + 3 * tw + 3] += sR * nw;
                      tBuffer[tIndex + 3 * tw + 4] += sG * nw;
                      tBuffer[tIndex + 3 * tw + 5] += sB * nw;
                  }
              } // end for sx
          } // end for sy

          // create result canvas
          var resCV = document.createElement('canvas');
          resCV.width = tw;
          resCV.height = th;
          var resCtx = resCV.getContext('2d');
          var imgRes = resCtx.getImageData(0, 0, tw, th);
          var tByteBuffer = imgRes.data;
          // convert float32 array into a UInt8Clamped Array
          var pxIndex = 0; //
          for (sIndex = 0, tIndex = 0; pxIndex < tw * th; sIndex += 3, tIndex += 4, pxIndex++) {
              tByteBuffer[tIndex] = Math.ceil(tBuffer[sIndex]);
              tByteBuffer[tIndex + 1] = Math.ceil(tBuffer[sIndex + 1]);
              tByteBuffer[tIndex + 2] = Math.ceil(tBuffer[sIndex + 2]);
              tByteBuffer[tIndex + 3] = 255;
          }
          // writing result to canvas.
          resCtx.putImageData(imgRes, 0, 0);
          return resCV;
      }

      var reader = new FileReader();
      reader.onload = function (event) {
        var image = new Image();
        image.src = event.target.result;

        image.onload = function() {
          var canvas = downScaleImage(image, 128);
          var dataUrl = canvas.toDataURL(inputAvatar.files[0].type);

          $scope.avatarSrc = dataUrl; //display the new avatar
          delete inputAvatar.files[0];

          $scope.$apply();
        };
      };

      inputAvatar.onchange = function() {
        var newAvatar = inputAvatar.files[0];
        if (typeof newAvatar !== 'undefined') {
          if (newAvatar.type.indexOf('image') === 0) { //the type start by 'image/*'
            reader.readAsDataURL(newAvatar); //trigger reader.onload() and resize the avatar to $scope.avatarSrc
          } else {
            delete inputAvatar.files[0];
            Toast.error('An image is expected.');
          }
        }
      };

      $scope.submitForm = function(params) {
        return $q(function(resolve, reject) {
           var url = (typeof $scope.url === 'function') ? $scope.url() : $scope.url;
           if ($scope.avatarSrc !== $scope.defaultSrc) params.avatar = $scope.avatarSrc;

            $http
              .post(url, params)
              .success(function(res) {
                Toast.success('Saved !');
                $scope.restoreAvatar(); //now the new avatar is the default

                return resolve(res);
              })
              .error(function(err) {
                console.log(err);
                Toast.error(err);

                return reject(err);
              });

        });
      };


    }]
  };
});
