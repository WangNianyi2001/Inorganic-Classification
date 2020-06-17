'use strict';

const oxidationCount = 12;
const computeOxidation = ({H = 0, OH = 0, O = 0, charge = 0}) => O + O + OH - H + charge;
const toHTML = (element, {H = 0, OH = 0, O = 0, charge = 0}) =>
	(H ? 'H' + (H === 1 ? '' : '<sub>' + H + '</sub>') : '') +
	element +
	(O ? 'O' + (O === 1 ? '' : '<sub>' + O + '</sub>') : '') +
	(OH ? (OH === 1 ? 'OH' : '(OH)' + '<sub>' + OH + '</sub>') : '') +
	(charge ? ('<sup>' + (Math.abs(charge) === 1 ? '' : Math.abs(charge)) + (charge <  0 ? '-' : '+') + '</sup>') : '');
const oxidationToRow = oxidation => +oxidation + 4;
const rowToOxidation = row => (i => i === 0 ? '0' : i > 0 ? '+' + i : '' + i)(row - 4);

const attribs = {
	less: 'less',
	nonexist: 'nonexist',
	more: 'more',
};
const elements = [
	{
		group: 'IA',
		valence: 1,
		name: 'Na',
		materials: [
			{ H: 1, attrib: [attribs.less], },
			{ OH: 1, attrib: [attribs.less], },
		],
	},
	{
		group: 'IIA',
		valence: 2,
		name: 'Mg',
		materials: [
			{ H: 2, attrib: [attribs.less], },
			{ H: 1, OH: 1, attrib: [attribs.nonexist, attribs.less], },
			{ O: 1, attrib: [attribs.less], },
		],
	},
	{
		group: 'IIIA',
		valence: 3,
		name: 'Al',
		materials: [
			{ H: 3, attrib: [attribs.less], },
			{ H: 2, OH: 1, attrib: [attribs.nonexist, attribs.less], },
			{ H: 1, O: 1, attrib: [attribs.nonexist, attribs.less], },
			{ OH: 1, O: 1, attrib: [attribs.less], },
		],
	},
	{
		group: 'IVA',
		valence: 4,
		name: 'Si',
		materials: [
			{ H: 4, },
			{ H: 3, OH: 1, },
			{ H: 2, O: 1, },
			{ H: 1, OH: 1, O: 1, },
			{ O: 2, },
		],
	},
	{
		group: 'VA',
		valence: 5,
		name: 'P',
		materials: [
			{ H: 3, },
			{ H: 2, OH: 1, },
			{ H: 1, O: 1, },
			{ OH: 1, O: 1, },
			{ OH: 1, O: 2, attrib: [attribs.more], },
		],
	},
	{
		group: 'VIA',
		valence: 6,
		name: 'S',
		materials: [
			{ H: 2, },
			{ H: 1, OH: 1, },
			{ O: 1, },
			{ O: 2, attrib: [attribs.more], },
			{ O: 3, attrib: [attribs.more], },
		],
	},
	{
		group: 'VIIA',
		valence: 7,
		name: 'Cl',
		materials: [
			{ H: 1, },
			{ OH: 1, },
			{ OH: 1, O: 1, attrib: [attribs.more], },
			{ OH: 1, O: 2, attrib: [attribs.more], },
			{ OH: 1, O: 3, attrib: [attribs.more], },
		],
	},
];
const elementCount = elements.length;

const create = Document.prototype.createElement.bind(document);

const $redox = create('table');
{
	const $rows = Array(oxidationCount).fill(0).map(() => {
		const $tr = create('tr');
		for(let i = 0; i < elementCount; ++i)
			$tr.appendChild(create('td'));
		return $tr;
	});
	for(let column = 0; column < elementCount; ++column) {
		const element = elements[column];
		for(const material of element.materials) {
			const oxidation = computeOxidation(material);
			const row = oxidationToRow(oxidation);
			const HTML = toHTML(element.name, material);
			const $td = $rows[row].children[column];
			material.td = $td;
			$td.element = element;
			$td.material = material;
			$td.addEventListener('click', choose);
			$td.innerHTML = HTML;
			$td.classList.add('material');
			if(!material.attrib)
				continue;
			for(const attrib of material.attrib)
				$td.classList.add(attrib);
		}
	}
	for(let row = 0; row < oxidationCount; ++row) {
		const oxidation = rowToOxidation(row);
		const $td = create('td');
		$td.innerText = oxidation;
		$td.classList.add('oxidation');
		$rows[row].insertBefore($td, $rows[row].firstChild);
	}
	{
		const $tr = create('tr');
		const $head = create('td');
		$head.innerHTML = '<sub>Oxidation</sub><sup>Group</sup>';
		$tr.appendChild($head);
		for(const element of elements) {
			const $td = create('td');
			$td.innerText = element.group;
			$td.classList.add('group');
			$tr.appendChild($td);
		}
		$redox.insertBefore($tr, $redox.firstChild);
	}
	$rows.forEach($row => $redox.appendChild($row));
	$redox.setAttribute('border', '1');
	$redox.setAttribute('cellspacing', '0');
	document.getElementById('redox').appendChild($redox);
}

const $ab = document.getElementById('ab-table');

let selected = null;
function choose() {
	if(selected)
		selected.classList.remove('selected');
	selected = this;
	selected.classList.add('selected');
	$ab.innerHTML = '';
	const { H = 0, OH = 0, O = 0 } = this.material;
	const xoffset = OH + O + O;
	const $tds = [];
	const size = 9;
	for(let i = 0; i < size; ++i) {
		const $tr = create('tr');
		$ab.appendChild($tr);
		const row = [];
		$tds.push(row);
		for(let i = 0; i < size; ++i) {
			const $td = create('td');
			$tr.appendChild($td);
			row.push($td);
		}
	}
	$tds[xoffset - O][xoffset].classList.add('selected');
	for(let x = 0; x < size; ++x) {
		for(let y = 0; y <= x >> 1; ++y) {
			const $td = $tds[x - y][x];
			$td.classList.add('material');
			$td.innerHTML = toHTML(
				this.element.name, {
					H,
					OH: x - y - y,
					O: y,
					charge: xoffset - x
				}
			);
		}
	}
}

choose.call(elements[2].materials[3].td);