
let itemsData = [];
let serial = 1;
let grandTotal = 0;

/* ---------------- AUTO LOAD EXCEL ---------------- */

window.onload = function() {
    fetch('ITEMLIST_MADAR.xlsx')
    .then(response => response.arrayBuffer())
    .then(data => {
        let workbook = XLSX.read(data, {type:'array'});
        let sheet = workbook.Sheets[workbook.SheetNames[0]];
        itemsData = XLSX.utils.sheet_to_json(sheet);
        loadDropdown();
    })
    .catch(error => {
        console.error("Error loading Excel:", error);
        alert("Unable to load items.xlsx file.");
    });
};

/* ---------------- LOAD DROPDOWN ---------------- */

function loadDropdown(){
    let dropdown = document.getElementById("itemDropdown");
    dropdown.innerHTML = '<option value="">Select Item</option>';

    itemsData.forEach((item,index)=>{
        dropdown.innerHTML += 
        '<option value="${index}">${item["Item Name"]}</option>';
    });
}

/* ---------------- AUTO FILL ---------------- */

function autoFill(){
    let selectedName = document.getElementById("itemInput").value;

    let item = itemsData.find(i => i["Item Name"] === selectedName);

    if(!item) return;

    document.getElementById("price").value = item["Price"];
    document.getElementById("unit").value = item["Unit"];

}

function loadDropdown(){
    let datalist = document.getElementById("itemsList");
    datalist.innerHTML = "";

    itemsData.forEach((item)=>{
        datalist.innerHTML += 
        `<option value="${item["Item Name"]}">`;
    });
}

/* ---------------- ADD ITEM ---------------- */

function addItem(){
    let selectedName = document.getElementById("itemInput").value;
	let item = itemsData.find(i => i["Item Name"] === selectedName);

	if(!item){
		alert("Please select valid item from list");
		return;
	}
    let qty = parseFloat(document.getElementById("quantity").value);
	let price = parseFloat(document.getElementById("price").value);
	let unit = document.getElementById("unit").value;
	
	console.log(price);
	console.log(unit);
	
	 if (!qty || qty <= 0) 
	 {
        alert("⚠ Please enter a valid Quantity (cannot be blank or 0)");
		document.getElementById("quantity").style.border = "2px solid red";
        return;
    }
	
	if (!price || price <= 0) 
	 {
        alert("⚠ Please enter a valid Price (cannot be blank or 0)");
		document.getElementById("price").style.border = "2px solid red";
        return;
    }
	
    let total = price * qty;
    grandTotal += total;

    let table = document.querySelector("#menuTable tbody");
    let row = table.insertRow();

    row.innerHTML = `
    <td>${serial++}</td>
    <td>${item["Item Name"]}</td>
    <td>${price}</td>
    <td>${unit}</td>
    <td>${qty}</td>
    <td>${total}</td>
    <td><button onclick="deleteRow(this,${total})">Delete</button></td>
    `;

    document.getElementById("grandTotal").innerText = grandTotal;
    
	document.getElementById("itemInput").value="";
	document.getElementById("price").value="";
	document.getElementById("unit").value="";
	document.getElementById("quantity").value="";
	
	
	document.getElementById("price").style.border = "";
	document.getElementById("quantity").style.border = "";
}

/* ---------------- DELETE ---------------- */

function deleteRow(btn,total){
    btn.closest("tr").remove();
    grandTotal -= total;
    document.getElementById("grandTotal").innerText = grandTotal;
}

async function exportPDF(){

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');

    let today = new Date();
    let formattedDate = today.toLocaleDateString('en-IN');
	

    // ---- HEADER SECTION ----
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("ANJUMAN-E-FATEMI", 105, 20, { align: "center" });

    doc.setFontSize(14);
    doc.text("FAIZ AL MAWAID AL BURHANIYAH", 105, 28, { align: "center" });


    // ---- LOGO (Optional) ----
    // If you have logo.png in repo, uncomment this:

    
    let leftImg = new Image();
	let rightImg = new Image();
    
	leftImg.src = "assests/img/FTNLogo.png";
	rightImg.src = "assests/img/FMBLogo.png";
	
    doc.addImage(leftImg, "PNG", 14, 15, 25, 20);
    doc.addImage(rightImg, "PNG", 170, 10, 25, 25);

	let menu = document.getElementById("MenuItemInput").value;
	let gregDate = document.getElementById("gregorianDate").value;
	let day = document.getElementById("dayName").value;

	let hijriDay = document.getElementById("hijriDay").value;
	let hijriMonth = document.getElementById("hijriMonth").value;
	let hijriYear = document.getElementById("hijriYear").value;

	let fileName = `${hijriDay}_${hijriMonth}_${hijriYear}`;


	doc.setFontSize(11);
	doc.setFont("helvetica", "normal");

	doc.text(`Menu: ${menu}`, 14, 50);
	doc.text(`Gregorian Date: ${gregDate}`, 14, 58);
	doc.text(`Day: ${day}`, 14, 66);
	doc.text(`Hijri Date: ${hijriDay} ${hijriMonth} ${hijriYear}`, 14, 74);



    // ---- TABLE DATA ----
    let rows = document.querySelectorAll("#menuTable tbody tr");
    let tableData = [];

    rows.forEach(row => {
        tableData.push([
            row.cells[0].innerText,
            row.cells[1].innerText,
            row.cells[2].innerText,
            row.cells[3].innerText,
            row.cells[4].innerText,
            row.cells[5].innerText
        ]);
    });

    doc.autoTable({
        startY: 85,
        head: [["Sr", "Item", "Price", "Unit", "Qty", "Total"]],
        body: tableData,
        theme: "grid",
        headStyles: {
            fillColor: [230, 230, 230],
            textColor: 0,
            fontStyle: 'bold'
        },
        styles: {
            fontSize: 10
        }
    });

    // ---- GRAND TOTAL SECTION ----
   let finalY = doc.lastAutoTable.finalY + 10;

    doc.setFillColor(255, 255, 0); // Yellow full row
    doc.rect(14, finalY, 182, 12, "F");

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");

    doc.text(
        "GRAND TOTAL : " + grandTotal,
        105,
        finalY + 8,
        { align: "center" }
    );

    // ---- SIGNATURE SECTION ----
    finalY += 25;

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    doc.save(fileName+".pdf");
	exportExcel();
}

function formatINR(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2
    }).format(amount);
}

function exportExcel() {

    let rows = document.querySelectorAll("#menuTable tbody tr");
    let data = [];

	let menu = document.getElementById("MenuItemInput").value;
	let gregDate = document.getElementById("gregorianDate").value;
	let day = document.getElementById("dayName").value;

	let hijriDay = document.getElementById("hijriDay").value;
	let hijriMonth = document.getElementById("hijriMonth").value;
	let hijriYear = document.getElementById("hijriYear").value;

	data.push(["Menu", menu]);
	data.push(["Gregorian Date", gregDate]);
	data.push(["Day", day]);
	data.push(["Hijri Date", `${hijriDay} ${hijriMonth} ${hijriYear}`]);
	data.push([]); // empty row
	data.push(["Sr", "Item", "Price", "Unit", "Qty", "Total"]);

    rows.forEach(row => {
        data.push([
            row.cells[0].innerText,
            row.cells[1].innerText,
            row.cells[2].innerText,
            row.cells[3].innerText,
            row.cells[4].innerText,
            row.cells[5].innerText
        ]);
    });

    data.push(["", "", "", "", "Grand Total", grandTotal]);

    let worksheet = XLSX.utils.aoa_to_sheet(data);
    let workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

    let fileName = `${hijriDay}_${hijriMonth}_${hijriYear}`;

    XLSX.writeFile(workbook, fileName+".xlsx");
}

function calculateDay() {

    let dateValue = document.getElementById("gregorianDate").value;

    if (!dateValue) return;

    let date = new Date(dateValue);

    let weekday = date.toLocaleDateString('en-IN', { weekday: 'long' });

    document.getElementById("dayName").value = weekday;

    // Save globally for PDF / Excel
    window.selectedDayName = weekday;
}

// Fill Hijri Days
for (let i = 1; i <= 30; i++) {
    let option = document.createElement("option");
    option.value = i;
    option.text = i;
    document.getElementById("hijriDay").appendChild(option);
}

// Fill Hijri Years
for (let y = 1440; y <= 1450; y++) {
    let option = document.createElement("option");
    option.value = y;
    option.text = y;
    document.getElementById("hijriYear").appendChild(option);
}