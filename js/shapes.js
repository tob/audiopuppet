export function drawShape({ ctx, shape, size, x, y }) {
  const video = document.querySelector(`#${shape}`);
  ctx.beginPath();
  ctx.rect(x, y, size, window.innerHeight / 4);
  const { offsetX, offsetY, width, height } = cover(
    size,
    window.innerHeight / 4,
    video.clientWidth,
    video.clientHeight
  );

  console.log({ offsetX, offsetY, width, height, realHeight: window.innerHeight / 4 })
  //   var offsetX = 1; // center x
  //   var offsetY = 0.5; // center y
  //   drawImageProp(
  //     ctx,
  //     video,
  //     x,
  //     y,
  //     size,
  //     window.innerHeight / 4
  //     //   offsetX,
  //     //   offsetY
  //   );
  ctx.drawImage(video, x, y, width, height);
}

function drawImageProp(ctx, img, x, y, w, h, offsetX, offsetY) {
  if (arguments.length === 2) {
    x = y = 0;
    w = ctx.canvas.width;
    h = ctx.canvas.height;
  }

  // default offset is center
  offsetX = typeof offsetX === "number" ? offsetX : 0.5;
  offsetY = typeof offsetY === "number" ? offsetY : 0.5;

  // keep bounds [0.0, 1.0]
  if (offsetX < 0) offsetX = 0;
  if (offsetY < 0) offsetY = 0;
  if (offsetX > 1) offsetX = 1;
  if (offsetY > 1) offsetY = 1;

  var iw = img.clientWidth,
    ih = img.clientHeight,
    r = Math.min(w / iw, h / ih),
    nw = iw * r, // new prop. width
    nh = ih * r, // new prop. height
    cx,
    cy,
    cw,
    ch,
    ar = 1;

  // decide which gap to fill
  if (nw < w) ar = w / nw;
  if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh; // updated
  nw *= ar;
  nh *= ar;

  // calc source rectangle
  cw = iw / (nw / w);
  ch = ih / (nh / h);

  cx = (iw - cw) * offsetX;
  cy = (ih - ch) * offsetY;

  // make sure source rectangle is valid
  if (cx < 0) cx = 0;
  if (cy < 0) cy = 0;
  if (cw > iw) cw = iw;
  if (ch > ih) ch = ih;

  // fill image in dest. rectangle
  ctx.drawImage(img, cx, cy, cw, ch, x, y, w, h);
}

function fit(contains) {
  return (
    parentWidth,
    parentHeight,
    childWidth,
    childHeight,
    scale = 1,
    offsetX = 0.5,
    offsetY = 0.5
  ) => {
    const childRatio = childWidth / childHeight;
    const parentRatio = parentWidth / parentHeight;
    let width = parentWidth * scale;
    let height = parentHeight * scale;

    if (contains ? childRatio > parentRatio : childRatio < parentRatio) {
      height = width / childRatio;
    } else {
      width = height * childRatio;
    }

    return {
      width,
      height,
      offsetX: (parentWidth - width) * offsetX,
      offsetY: (parentHeight - height) * offsetY,
    };
  };
}

export const contain = fit(true);
export const cover = fit(false);
