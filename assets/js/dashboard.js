/** 
 * @copyright Copyright (c) 2022, GoldFrite
 * @license GNU GPLv3
 */

let h1 = document.getElementById('h1');
let caret = document.getElementById('caret');

h1.addEventListener("click", async () => {

	if (caret.style.transform == "rotate(90deg)") {

		caret.style.transform = "rotate(0deg)"
		document.getElementById("user-info").style.height = "0px"
		document.getElementById("user-info").style.opacity = "0"

	} else {

		caret.style.transform = "rotate(90deg)"
		document.getElementById("user-info").style.height = "100px"
		document.getElementById("user-info").style.opacity = "1"

	}

})