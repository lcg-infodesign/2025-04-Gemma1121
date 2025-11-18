let table;
let volcanoes = [];
let hovered = null;

const colors = {
  darkRed: "#B73535", 
  orange:  "#D36A4E", 
  khaki:   "#D7C9B4", 
  coyote:  "#A68D7C", 
  pink:    "#EEDFD3"  
};

function preload() {
  table = loadTable("data.csv", "csv");
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  textFont("Helvetica");

  noStroke();

  for (let r = 0; r < table.getRowCount(); r++) {
    let row = table.getRow(r);

    let name = row.getString(1);
    let country = row.getString(2);
    let lat = float(row.getString(4));
    let lon = float(row.getString(5));
    let elev = float(row.getString(6));
    let type = row.getString(7);
    let activity = row.getString(10);

    let c;
    if (type.includes("Strato")) c = colors.darkRed;
    else if (type.includes("Shield")) c = colors.orange;
    else if (type.includes("Caldera")) c = colors.khaki;
    else if (type.includes("Cone")) c = colors.coyote;
    else c = colors.pink;

    let radius = map(elev, 0, 4000, 4, 18);

    let alpha = map(activity.length, 0, 20, 90, 240);

    volcanoes.push({
      name, country, lat, lon, elev, type, activity,
      radius, c, alpha
    });
  }
}

function draw() {
  background("#F4F1EC"); 

  drawTitle();

  hovered = null;

  for (let v of volcanoes) {
    v.x = map(v.lon, -180, 180, 80, width - 80);

    let latRad = radians(v.lat);
    let mercY = log(tan(PI / 4 + latRad / 2));
    v.y = map(mercY, -3.14, 3.14, height - 140, 140);


    if (dist(mouseX, mouseY, v.x, v.y) < v.radius * 1.3) hovered = v;

    drawGlyph(v);
  }

  drawLegend();
  if (hovered) drawTooltip(hovered);
}

function drawGlyph(v) {
  push();
  translate(v.x, v.y);


  rotate(radians(v.lon));

  let baseCol = color(v.c);
  baseCol.setAlpha(v.alpha);

  fill(baseCol);
  noStroke();
  ellipse(0, 0, v.radius * 2);

  let seg = 3 + (abs(hashString(v.country)) % 5); 
  let r = v.radius * 1.15; 
  stroke(60, 130);
  noFill();
  strokeWeight(1.6);

  beginShape();
  for (let i = 0; i < seg; i++) {
    let a = TWO_PI * (i / seg);
    vertex(cos(a) * r, sin(a) * r);
  }
  endShape(CLOSE);


  let numLines = round(map(abs(v.lat), 0, 90, 3, 8)); 
  stroke(80, 90);
  strokeWeight(1.3);
  for (let i = 0; i < numLines; i++) {
    let a = TWO_PI * (i / numLines);
    line(0, 0, cos(a) * v.radius, sin(a) * v.radius);
  }

  pop();
}


function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) & 0xffffffff;
  }
  return h;
}

function drawTitle() {
  fill("#333");
  textSize(32);
  textStyle(BOLD);
  text("Volcano Dataset — Abstract Geo-Glyphs", 40, 40);

  fill("#555");
  textSize(16);
  textStyle(NORMAL);
  text("Distribuzione geografica con codifica visiva multilivello", 40, 80);
}

function drawLegend() {
  let x0 = width - 240;
  let y0 = height - 230;

  fill(255, 230);
  stroke("#DDD");
  rect(x0 - 20, y0 - 20, 220, 200, 12);
  noStroke();

  fill("#333");
  textSize(15);
  textStyle(BOLD);
  text("Legenda", x0, y0);

  fill("#444");
  textSize(13);
  textStyle(NORMAL);
  text("Posizione → Lat/Lon (Mercator)", x0, y0 + 30);
  text("Colore → Tipo di vulcano",      x0, y0 + 55);
  text("Dimensione → Elevazione",      x0, y0 + 80);
  text("Trasparenza → Attività",       x0, y0 + 105);
  text("Linee interne → Latitudine",   x0, y0 + 130);
  text("Rotazione → Longitudine",      x0, y0 + 155);
  text("Segmenti dell'anello → Paese", x0, y0 + 180);
}

function drawTooltip(v) {
  let boxW = 260;
  let boxH = 110;
  let px = mouseX + 20;
  let py = mouseY + 20;

  if (px + boxW > width) px = mouseX - boxW - 20;
  if (py + boxH > height) py = mouseY - boxH - 20;

  fill(255, 240);
  stroke("#CCC");
  rect(px, py, boxW, boxH, 12);

  noStroke();
  fill("#111");
  textSize(14);
  textStyle(BOLD);
  text(v.name, px + 12, py + 10);

  fill("#444");
  textSize(12);
  textStyle(NORMAL);
  text(`Country: ${v.country}
Type: ${v.type}
Elevation: ${v.elev} m
Activity: ${v.activity}`,
       px + 12, py + 34);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
