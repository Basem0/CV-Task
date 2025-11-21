/* ===== Default Points ===== */
const defaultPoints = [
  [0,0,0],[0,1,0],[0,2,0],[0,3,0],[0,4,0],
  [1,4,0],[2,4,0],[3,4,0],[1,2,0],[2,2,0],
  [1,0,0],[2,0,0],[3,0,0],[0,0,1],[0,0,2],
  [0,0,3],[0,0,4],[1,0,4],[2,0,4],[3,0,4],
  [1,0,2],[2,0,2],[0,4,4],[0,0,3],[0,1,4],
  [0,3,4],[0,2,4]
];

let points = JSON.parse(JSON.stringify(defaultPoints));

/* ===== Helpers ===== */
function dedupe(arr) {
    const seen = new Set();
    const result = [];
    for (const p of arr) {
        const key = p.join(",");
        if (!seen.has(key)) {
            seen.add(key);
            result.push(p);
        }
    }
    return result;
}

function rebuildTable() {
    const tbody = document.querySelector("#pointsTable tbody");
    tbody.innerHTML = "";
    points.forEach((p,i) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${i}</td>
          <td contenteditable="true" data-col="x">${p[0]}</td>
          <td contenteditable="true" data-col="y">${p[1]}</td>
          <td contenteditable="true" data-col="z">${p[2]}</td>
          <td class="text-center">
            <input type="checkbox" class="form-check-input rowSelect" />
          </td>
        `;
        tbody.appendChild(tr);
    });
    attachCellListeners();
    updateStats();
    updatePlots();
}

function attachCellListeners() {
    document.querySelectorAll("#pointsTable td[contenteditable='true']").forEach(cell => {
        cell.addEventListener("blur", () => commitCellEdit(cell));
        cell.addEventListener("keydown", e => {
            if (e.key === "Enter") {
                e.preventDefault();
                cell.blur();
            }
        });
    });
}

function commitCellEdit(cell) {
    const rowIndex = cell.parentElement.rowIndex - 1;
    const col = cell.dataset.col;
    let val = parseFloat(cell.textContent.trim());
    if (isNaN(val)) {
        cell.textContent = "0";
        val = 0;
    }
    if (!points[rowIndex]) return;
    if (col === "x") points[rowIndex][0] = val;
    if (col === "y") points[rowIndex][1] = val;
    if (col === "z") points[rowIndex][2] = val;
    updatePlots();
    updateStats();
}

function updateStats() {
    const xs = points.map(p=>p[0]);
    const ys = points.map(p=>p[1]);
    const zs = points.map(p=>p[2]);
    const stats = {
        count: points.length,
        xRange: [Math.min(...xs), Math.max(...xs)],
        yRange: [Math.min(...ys), Math.max(...ys)],
        zRange: [Math.min(...zs), Math.max(...zs)],
        uniqueX: [...new Set(xs)].length,
        uniqueY: [...new Set(ys)].length,
        uniqueZ: [...new Set(zs)].length
    };
    
    document.getElementById("statsBox").innerHTML = `
      <div class="stats-grid mb-3">
        <div class="stat-item">
          <div class="stat-value">${stats.count}</div>
          <div class="stat-label">Total Points</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${stats.uniqueX}</div>
          <div class="stat-label">Unique X</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${stats.uniqueY}</div>
          <div class="stat-label">Unique Y</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${stats.uniqueZ}</div>
          <div class="stat-label">Unique Z</div>
        </div>
      </div>
      <div class="small">
        <strong>X Range:</strong> ${stats.xRange.join(" → ")}<br>
        <strong>Y Range:</strong> ${stats.yRange.join(" → ")}<br>
        <strong>Z Range:</strong> ${stats.zRange.join(" → ")}
      </div>
    `;
}

/* ===== Plotting ===== */
function updatePlots() {
    const doDedupe = document.getElementById("dedupeToggle").checked;
    const pts = doDedupe ? dedupe(points) : points;
    const showLines = document.getElementById("showLines3D").checked;
    const annotate = document.getElementById("showAnnotations").checked;
    const autoAspect = document.getElementById("autoAspect").checked;

    const xs = pts.map(p=>p[0]);
    const ys = pts.map(p=>p[1]);
    const zs = pts.map(p=>p[2]);

    // 3D trace
    const trace3d = {
        type:"scatter3d",
        x: xs, y: ys, z: zs,
        mode: showLines ? "lines+markers" : "markers",
        marker: { 
            size: 5, 
            color: '#0d6efd',
            line: { color: '#0b5ed7', width: 1 }
        },
        line: { width: 2, color: "rgba(13, 110, 253, 0.5)" },
        name:"Points"
    };

    let annotations3d = [];
    if (annotate) {
        annotations3d = pts.map((p,i)=> ({
            x:p[0], y:p[1], z:p[2],
            text:i.toString(),
            showarrow:false,
            font:{size:9, color:"#212529"}
        }));
    }

    const layout3d = {
        margin:{l:0,r:0,t:30,b:0},
        scene:{
            xaxis:{title:"X"},
            yaxis:{title:"Y"},
            zaxis:{title:"Z"},
            aspectmode: autoAspect ? "data" : "cube"
        },
        annotations: annotations3d,
        title: {text:"3D Scatter View", font:{size:14}}
    };

    Plotly.react("plot3d", [trace3d], layout3d, {displaylogo:false, responsive:true});

    // 2D projections
    function make2D(id, xVals, yVals, xt, yt, title) {
        const trace = {
            type:"scatter",
            x:xVals,
            y:yVals,
            mode:"markers",
            marker:{size:8, color:"#0d6efd"}
        };
        let ann = [];
        if (annotate) {
            ann = xVals.map((x,i)=> ({
                x:xVals[i], y:yVals[i],
                text:i.toString(),
                showarrow:false,
                font:{size:8}
            }));
        }
        Plotly.react(id, [trace], {
            margin:{l:40,r:10,t:30,b:40},
            xaxis:{title:xt, zeroline:true},
            yaxis:{title:yt, zeroline:true, scaleanchor:"x", scaleratio:1},
            annotations: ann,
            title: {text:title, font:{size:13}}
        }, {displaylogo:false, responsive:true});
    }

    make2D("plotXY", xs, ys, "X", "Y", "XY Projection");
    make2D("plotYZ", ys, zs, "Y", "Z", "YZ Projection");
    make2D("plotXZ", xs, zs, "X", "Z", "XZ Projection");
}

/* ===== Raw Text Import / Export ===== */
function exportToTextarea() {
    const lines = points.map(p=>p.join(","));
    document.getElementById("rawInput").value = lines.join("\n");
}

function applyFromTextarea() {
    const txt = document.getElementById("rawInput").value.trim();
    if (!txt) return;
    const newPts = [];
    txt.split(/\n|;/).forEach(line => {
        line = line.trim();
        if (!line) return;
        line = line.replace(/[()\[\]]/g,"");
        const parts = line.split(",").map(v => v.trim()).filter(v=>v.length>0);
        if (parts.length !== 3) return;
        const nums = parts.map(Number);
        if (nums.some(n => isNaN(n))) return;
        newPts.push(nums);
    });
    if (newPts.length) {
        points = newPts;
        rebuildTable();
    }
}

/* ===== Event Listeners ===== */
document.getElementById("addPointBtn").addEventListener("click", () => {
    const x = parseFloat(document.getElementById("addX").value);
    const y = parseFloat(document.getElementById("addY").value);
    const z = parseFloat(document.getElementById("addZ").value);
    if ([x,y,z].some(v => isNaN(v))) {
        alert("Please enter numeric X, Y, Z values.");
        return;
    }
    points.push([x,y,z]);
    document.getElementById("addX").value =
    document.getElementById("addY").value =
    document.getElementById("addZ").value = "";
    rebuildTable();
});

document.getElementById("deleteSelectedBtn").addEventListener("click", () => {
    const rows = Array.from(document.querySelectorAll("#pointsTable tbody tr"));
    const survivors = [];
    rows.forEach((tr,i) => {
        const cb = tr.querySelector(".rowSelect");
        if (!cb.checked) survivors.push(points[i]);
    });
    if (survivors.length === points.length) {
        alert("No points selected for deletion.");
        return;
    }
    points = survivors;
    rebuildTable();
});

document.getElementById("applyRawBtn").addEventListener("click", applyFromTextarea);
document.getElementById("exportRawBtn").addEventListener("click", exportToTextarea);
document.getElementById("resetBtn").addEventListener("click", () => {
    if (confirm("Reset to default points? This will discard your changes.")) {
        points = JSON.parse(JSON.stringify(defaultPoints));
        rebuildTable();
        exportToTextarea();
    }
});

["showLines3D","dedupeToggle","showAnnotations","autoAspect"].forEach(id => {
    document.getElementById(id).addEventListener("change", updatePlots);
});

/* ===== Initialize ===== */
rebuildTable();
exportToTextarea();
updatePlots();
