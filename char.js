/*******************************************
	Keep track of format version
	for character files
*******************************************/
var formatVersion = 1.3;

/*******************************************
	Lists of things
*******************************************/
var abilityNames = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
var defenseNames = ['for', 'ref', 'wil'];
var attributeNames = ['name', 'class', 'race', 'align', 'gender'];
var miscNames = ['hp', 'hpMax', 'lv', 'gp', 'sp', 'cp'];
var acNames = ['ac', 'grapple'];
var defenseAbilityMapping = {'for':'con', 'ref':'dex', 'wil':'wis'};
var skillAbilityMapping = {
	'appraise'						:'int',
	'autohypnosis'					:'wis',
	'balance'						:'dex',
	'bluff'							:'cha',
	'climb'							:'str',
	'concentration'					:'con',
	'craft1'						:'int',
	'craft2'						:'int',
	'craft3'						:'int',
	'decipher script'				:'int',
	'diplomacy'						:'cha',
	'disable device'				:'dex',
	'disguise'						:'cha',
	'escape artist'					:'dex',
	'forgery'						:'int',
	'gather information'			:'cha',
	'handle animal'					:'cha',
	'heal'							:'wis',
	'hide'							:'dex',
	'intimidate'					:'cha',
	'jump'							:'str',
	'knowledge (arcana)'			:'int',
	'knowledge (arch/eng)'			:'int',
	'knowledge (dungeoneering)'		:'int',
	'knowledge (geography)'			:'int',
	'knowledge (history)'			:'int',
	'knowledge (local)'				:'int',
	'knowledge (nature)'			:'int',
	'knowledge (nobility/royalty)'	:'int',
	'knowledge (the planes)'		:'int',
	'knowledge (psionics)'			:'int',
	'knowledge (religion)'			:'int',
	'knowledge1'					:'int',
	'listen'						:'wis',
	'move silently'					:'dex',
	'open lock'						:'dex',
	'perform (act)'					:'cha',
	'perform (comedy)'				:'cha',
	'perform (dance)'				:'cha',
	'perform (keyboard)'			:'cha',
	'perform (oratory)'				:'cha',
	'perform (percussion)'			:'cha',
	'perform (string instrument)'	:'cha',
	'perform (wind instrument)'		:'cha',
	'perform (sing)'				:'cha',
	'perform1'						:'cha',
	'profession1'					:'wis',
	'profession2'					:'wis',
	'psicraft'						:'int',
	'ride'							:'dex',
	'search'						:'int',
	'sense motive'					:'wis',
	'sleight of hand'				:'dex',
	'spellcraft'					:'int',
	'spot'							:'wis',
	'survival'						:'wis',
	'swim'							:'str',
	'tumble'						:'dex',
	'use magic device'				:'cha',
	'use psionic device'			:'cha',
	'use rope'						:'dex'
};
var abilityToSkillsMapping ={'cha':
	['bluff','diplomacy','disguise','gather information','handle animal','intimidate','perform (act)','perform (comedy)','perform (dance)','perform (keyboard)','perform (oratory)','perform (percussion)','perform (string instrument)','perform (wind instrument)','perform (sing)','perform1','use magic device','use psionic device'],	
							'con':
	['concentration'],	
							'dex':
	['use rope','balance','disable device','escape artist','hide','move silently','open lock','ride','sleight of hand','tumble'],	
							'int':
	['appraise','craft1','craft2','craft3','decipher script','forgery','knowledge (arcana)','knowledge (arch/eng)','knowledge (dungeoneering)','knowledge (geography)','knowledge (history)','knowledge (local)','knowledge (nature)','knowledge (nobility/royalty)','knowledge (the planes)','knowledge (psionics)','knowledge (religion)','knowledge1','psicraft','search','spellcraft'],
							'str':
	['climb','jump','swim'],
							'wis':
	['autohypnosis','heal','listen','profession1','profession2','sense motive','spot','survival']
};

/*******************************************
	Input naming conventions
*******************************************/
var abilityInputNames = ['_TotalInput', '_BaseInput', '_BonusInput', '_PenalInput', '_ModInput'];
var defenseInputNames = ['_TotalInput', '_BaseInput','_ModInput', '_MiscInput'];

/*******************************************
	Global Objects
*******************************************/
var activeCharacterName;		//Filename of character being worked on. Undefined until'load'
var activeCharacter;			//Character object being used
var characterFiles = getCharacterFiles(); //Collection of character files
var dirtyBit = false;				//Keep track of whether character has been modified since last save.

//Some command line variables
var commandLineHistory = [];		//Keep track of command line history for recall.
var commandLineCursor = 0;
var commandLineDirtyBit = false;
var mostRecentCommand = '';
/*******************************************
	Important DOM elements
*******************************************/
var abilityContainer;
var attributes;
var inputs = {};
var commandBox;
var outputConsole;

/*******************************************
	Templates for repetitive HTML sections
*******************************************/
var abilityTemplate = "		<div id='{ability}Container' class='characterAttr'>\
			<span class='attrName'>{ABILITY}</span>\
				<input id='{ability}_TotalInput' class='ability totalBox' readonly placeholder='Total' pattern='[0-9]+' type='text'></input> = \n\
				<input id='{ability}_BaseInput' class='ability ability_Input' placeholder='Base' pattern='[0-9]+' type='text'></input> + \n\
				<input id='{ability}_BonusInput' class='ability ability_Input' placeholder='Bonus' pattern='[0-9]+' type='test'></input> -\n\
				<input id='{ability}_PenalInput' class='ability ability_Input' placeholder='Penal.' pattern='[0-9]+' type='test'></input>\n\
				<input id='{ability}_ModInput' class='ability totalBox' readonly placeholder='Mod'  pattern='[0-9]+'type='text'></input>\n\
		</div>\n";

var defenseTemplate = "			<div id='{defense}Container' class='characterAttr'>\n\
				<span class='attrName'>{DEFENSE}</span>\n\
					<input id='{defense}_TotalInput' class='defense totalBox' readonly placeholder='Total' type='text'></input> = \n\
					<input id='{defense}_BaseInput' class='defense defense_Input' placeholder='Base' type='text'></input> + \n\
					<input id='{defense}_ModInput' class='defense totalBox' readonly placeholder='Mod' type='text'></input> +\n\
					<input id='{defense}_MiscInput' class='defense defense_Input' placeholder='Misc' type='text'></input>\n\
			</div>\n";
			
var attributeTemplate = "				<div id='{attr}Container' class='characterAttr'>\n\
					<span class='attrName'>{Attr}:</span><input id='{attr}_Input' class='attribute attribute_Input' type='text'></input>\n\
				</div>\n";

var skillTemplate = "<div id='{skill}' class='characterAttr'>\n" +
					"<input id='{skill}_TrainedInput' class='{skill} skill_Input trained_checkbox {skill}_Input' type='checkbox' title='Trained?'></input>\n"+
					"<span class='skillMod'>{ABILITY}</span>\n" +
					"<span class='attrName'>{Skill}</span>\n"	+
						"<input id='{skill}_TotalInput' class='{skill} totalBox' readonly placeholder='Total' type='text'></input> = \n" + 
						"<input id='{skill}_RanksInput' class='{skill} skill_Input skill' placeholder='Ranks' type='text'></input> + \n" +
						"<input id='{skill}_ModInput' class='{skill} totalBox' readonly placeholder='{ABILITY}' type='text'></input> + \n" +
						"<input id='{skill}_MiscInput' class='{skill} skill_Input {skill}_Input' placeholder='Misc' type='text'></input>\n" +
				"</div>\n";

var itemInvTemplate = 	"<div id='{name}_ItemEntry' class='item characterAttr'>\n" + 
							"<span id='{name}_ItemName' class='itemAttr itemName'>{name}</span>\n" +
					  		"<span contenteditable='true' id='{name}_ItemQuantity' class='itemInput itemAttr itemQuantity'>{quantity}</span>\n" + 
					  		"<span contenteditable='true' id='{name}_ItemDescription' class='itemInput itemAttr itemDescription' title='{description}'>{description}\n" + 
					  	"</div>\n";

/*******************************************
			Utility/helper functions
*******************************************/
//Replace all instances of a sequence in a string
function replaceAll(find, replace, str) {
	return str.replace(new RegExp(find, 'g'), replace);
}

//Find a key in an object given the value
function getKey(obj, value){
    keys = Object.keys(obj);
    for(var i = 0; i < keys.length; i++){
        if(obj[keys[i]] == value){
             return keys[i];   
        }
    }
    return undefined;
}

//Capitalize first letter
function capitalize(str)
{
    return str.charAt(0).toUpperCase() + str.slice(1);
}

//Strip whitespace
function strip(string){
	return string.replace(/(^\s+|\s+$)/g,'');
}

//Set/unset dirty bit

function setDirtybit(){
	dirtyBit = true;
}

function unsetDirtyBit(){
	dirtyBit = false;
}
/*******************************************
	Important application functions
*******************************************/

//Load the attribute HTML
function loadElementsAttributes(abilityNames, defenseNames, attributeNames, skillAbilityMapping){
	var output = ''
	
	//Load main abilities
	for (var i = 0; i < abilityNames.length; i++ ) {
		var buffer = replaceAll('{ability}', abilityNames[i], abilityTemplate);
		output +=  replaceAll('{ABILITY}', abilityNames[i].toUpperCase(), buffer);
	}
	
	//Load defense abilities
	for (var i = 0; i < defenseNames.length; i++ ) {
		var buffer = replaceAll('{defense}', defenseNames[i], defenseTemplate);
		output +=  replaceAll('{DEFENSE}', defenseNames[i].toUpperCase(), buffer);
	}
	abilityContainer.innerHTML = output;
	
	output = '';
	//Load attributes
	for (var i = 0; i < attributeNames.length; i++ ) {
		var buffer = replaceAll('{attr}', attributeNames[i], attributeTemplate);
		output +=  replaceAll('{Attr}', capitalize(attributeNames[i]), buffer);
	}
	attributes.innerHTML = output;
	
	output = '';
	//Load skills
	var skill;
	for (skill in skillAbilityMapping) {
		var buffer = replaceAll('{skill}', skill, skillTemplate);
		buffer =  replaceAll('{Skill}', capitalize(skill), buffer);
		output +=  replaceAll('{ABILITY}', skillAbilityMapping[skill].toUpperCase(), buffer);
	}
	skills.innerHTML = output;
}

//Load Inputs into Object
function loadElementsInputs(){
	//TODO DEBUG
	var inputElements = document.getElementsByTagName("INPUT");
	var test = '';
	for(var i = 0; i < inputElements.length; i++){
		inputs[inputElements[i].id] = inputElements[i] ;		//Arrange by name
	}	
}

//Attach listeners to inputs
function loadInputListeners(){
	var defenseInputs = document.getElementsByClassName('defense_Input');
	var abilityInputs = document.getElementsByClassName('ability_Input');	
	var attributeInputs = document.getElementsByClassName('attribute_Input');
	var miscInputs = document.getElementsByClassName('misc_Input');
	var acInputs = document.getElementsByClassName('ac_Input');
	var grappleInputs = document.getElementsByClassName('grapple_input');
	var skillInputs = document.getElementsByClassName('skill_Input');
	var skillCheckboxes = document.getElementsByClassName('trained_checkbox');
	var inventoryInputs = document.getElementsByClassName('itemInput');
	for (var i = 0; i < defenseInputs.length; i++){
		defenseInputs[i].addEventListener('change',handleDefenseChange, false);
	}
	for (var i = 0; i < abilityInputs.length; i++){
		abilityInputs[i].addEventListener('change',handleAbilityChange, false);
	}
	for (var i = 0; i < attributeInputs.length; i++){
		attributeInputs[i].addEventListener('change',handleAttributeChange, false);
	}
	for (var i = 0; i < miscInputs.length; i++){
		miscInputs[i].addEventListener('change',handleMiscChange, false);
	}
	for (var i = 0; i < acInputs.length; i++){
		acInputs[i].addEventListener('change',handleAcChange, false);
	}
	for (var i = 0; i < grappleInputs.length; i++){
		grappleInputs[i].addEventListener('change',handleGrappleChange, false);
	}
	for (var i = 0; i < skillInputs.length; i++){
		skillInputs[i].addEventListener('change',handleSkillChange, false);
	}
	for (var i = 0; i < skillCheckboxes.length; i++){
		skillCheckboxes[i].addEventListener('blur',handleSkillChange, false);
	}

	//Doesn't work with divs
//	for (var i = 0; i < inventoryInputs.length; i++){
//		inventoryInputs[i].addEventListener('change',handleInventoryChange, false);
//	}
	commandBox.addEventListener('keydown', handleCommandEntry, false);
}

//Attach any other listeners
function attachListeners(){
	$('#skillsExpandHide').click(handleHideShow);
	$('.itemInput').keypress(handleNewlineDisable);
	$('.itemInput').keypress(handleChange);
	$('input').change(handleChange);
	
	$(window).on('beforeunload', function(event){
		//Save last 10 commands entered if more than 10 entries
		if(commandLineHistory.length > 10){
			localStorage.setItem('commandLineHistory', JSON.stringify(commandLineHistory.slice(-10)));
		}else{
		//Save it directly if 10 or less.
			localStorage.setItem('commandLineHistory', JSON.stringify(commandLineHistory));
		}
		if(dirtyBit){
			return 'Your character has unsaved changes! Are you sure you want to leave?';
		}else{
			event.preventDefault();
		}
	});
	return;
}

//Get ability values
function getAbilityValue(attribute, field){
	inputs[attribute + capitalize(field) + 'Input'].value;
}

function getCharacterFiles(){
	//Filters using _char as regex
	var filterFunc = function(str){return str.match('_char');};
	var mapFunc = function(str){return str.replace('_char', '');};
	var chars = Object.keys(localStorage).filter(filterFunc).map(mapFunc);
	return chars;
}

/*******************************************
	Evalutators for numerical fields
*******************************************/
//Evaluates ability scores and fills in their Mod and total scores.
function evaluateAbility(abilityName){
	//check whether valid ability name. Return without doing anything if not a valid name.
	if(abilityNames.indexOf(abilityName) < 0){
		return;
	}
	var base = Number(inputs[abilityName + '_BaseInput'].value);
	var bonus = Number(inputs[abilityName + '_BonusInput'].value);
	var penal = Number(inputs[abilityName + '_PenalInput'].value);
	var mod = Math.floor((base - 10)/2);
	
	var total = base + bonus - penal;
	if(isNaN(total)){
		alert("Error: Non-numerical value detected in " + abilityName.toUpperCase());
		return false;
	}
	
	inputs[abilityName + '_ModInput'].value = mod;
	inputs[abilityName + '_TotalInput'].value = total;
	
	var defense;
	if((defense = getKey(defenseAbilityMapping, abilityName)) != undefined){
		evaluateDefense(defense);
	}
	return true;
}

//Evaluates ability scores and fills in their Mod and total scores.
function evaluateDefense(defenseName){
	//check whether valid defense name. Return without doing anything if not a valid name.
	if(defenseNames.indexOf(defenseName) < 0){
		return;
	}
	var base = Number(inputs[defenseName + '_BaseInput'].value);
	var misc = Number(inputs[defenseName + '_MiscInput'].value);
	var abilityMod = Number(inputs[defenseAbilityMapping[defenseName] + '_ModInput'].value);
	
	var total = base + misc + abilityMod;
	
	if(isNaN(total)){
		alert("Error: Non-numerical value detected in " + defenseName.toUpperCase());
		return false;
	}
	inputs[defenseName + '_ModInput'].value = abilityMod;
	inputs[defenseName + '_TotalInput'].value = total;
	return true;
}

//Evaluates AC
function evaluateAc(){
	var armor 	= Number(inputs['ac_ArmorBonusInput'].value);
	var shield 	= Number(inputs['ac_ShieldBonusInput'].value);
	var sizeMod	= Number(inputs['ac_SizeModInput'].value);
	var natural	= Number(inputs['ac_NaturalArmorInput'].value);
	var deflect	= Number(inputs['ac_DeflectionInput'].value);
	var misc	= Number(inputs['ac_MiscInput'].value);
	//fetch elements
	var mod		= inputs['ac_ModInput'];
	var total	= inputs['ac_TotalInput'];
	
	mod.value 	= Number(inputs['dex_ModInput'].value);
	var sum = 10 + Number(armor) + Number(shield) + Number(sizeMod) + Number(mod.value) + 
	              Number(natural) + Number(deflect) + Number(misc);
	if(isNaN(sum)){
		alert("Error: Non-numerical value detected in AC");
		return false;
	}
	
	total.value = sum;
	return true;
}

//Evaluate the grapple fields
function evaluateGrapple(){
	var attack 	= Number(inputs['grapple_BaseAttackInput'].value);
	var sizeMod	= Number(inputs['grapple_SizeModInput'].value);
	var misc	= Number(inputs['grapple_MiscInput'].value);
	//fetch elements
	var mod		= inputs['grapple_ModInput'];
	var total	= inputs['grapple_TotalInput'];
	
	mod.value 	= Number(inputs['str_ModInput'].value);
	var sum = 10 + Number(attack) + Number(sizeMod) + Number(misc) + Number(mod.value);
	if(isNaN(sum)){
		alert("Error: Non-numerical value detected in AC.");
		return false;
	}
	total.value = sum;
	return true;
}

//Evaluate the skill fields
function evaluateSkill(skillName){
	var modAblityInput	= inputs[skillAbilityMapping[skillName] + '_ModInput'];
	var modInput	= inputs[skillName + '_ModInput'];
	var totalInput	= inputs[skillName + '_TotalInput'];
	
	var ranks 		= Number(inputs[skillName + '_RanksInput'].value);
	var isTrained 	= inputs[skillName + '_TrainedInput'].checked;
	var mod 		= Number(modAblityInput.value);
	var ranksBonus 	= Math.floor(ranks * (isTrained? 1 : 0.5));
	var misc 		= Number(inputs[skillName + '_MiscInput'].value);
	
	var sum = mod + ranksBonus + misc;
	if(isNaN(sum)){
		alert("Error: Non-numerical value detected in " + skillName + ".");
		return false;
	}
	modInput.value = mod;
	totalInput.value = sum;
	return true;
}

//Evaluate Inventory Entry. Return false if evaluation fails.
function evaluateInventoryEntry(name){
	var quantity = Number(inputs[name + "_ItemQuantity"].innerHTML);
	var description = inputs[name + "_ItemDescription"].innerHTML;
	
	//Check if number
	if(isNaN(quantity)){
		alert("Error: Non-numerical value detected in " + name + ".")
		return false;
	}
	//If quantity is less than 1, set to 0
	if(quantity < 1){
		inputs[name + "_ItemQuantity"].innerHTML = 0;
	}
	return true;
}

/*******************************************
			Command line code
*******************************************/
//Print to the console
function printToConsole(string){
	outputConsole.value += string + '\n\n';
	outputConsole.scrollTop = outputConsole.scrollHeight - outputConsole.clientHeight;
}

//Parse and execute commands
function executeCommand(commandString){
	var command = commandString.split(' ');
	printToConsole('>>>' + commandString);
	characterFiles = getCharacterFiles(); 			//Update character array
	var helpFiles = [
					 'List of commands:',
					 '--save [<string: character name>]: Saves your character data. Optionally, provide a string for a name to save separately.',
					 '--clear: Clears all of the inputs and starts a new character sheet.',
					 '--clearConsole: Only clears the console.',
					 '--delete <string: character name>: Delete a specific character.',
					 '--chars: Prints a list of saved characters.',
					 '--load <string: character name>: Loads a character if it exists.',
					 '--setHP <int: new HP>: Sets HP to a number.',
					 '--heal <int: heal amount>: Adds number to HP.',
					 '--damage <int: damage amount>: Subtracts from HP.', 
					 '--addItem <string: item name>: Creates a new item and adds to the inventory.', 
					 '--removeItem <string: item name>: Removes item from your inventory.', 
					 '--roll <int: number of die sides> <int: number of dice>: Rolls dice and prints results.'
					 ];
	switch(command[0]){
		case 'help':
			var output = helpFiles.join('\n\n');
			printToConsole(output);
			break;
		case 'save':
			if(command.length > 1){
				saveData(command[1]);				//Save to a file name if given
				printToConsole('Character saved: ' + command[1]);
			}else{
				saveData(activeCharacterName);		//Else, use default
				if(activeCharacterName === undefined){
					printToConsole('Character data saved');
				}else{
					printToConsole('Character saved: ' + activeCharacterName);
				}
			}
			unsetDirtyBit();
			break;
		case 'clear':
			localStorage.removeItem('lastUsedChar');
			for(var i in inputs){
				inputs[i].value = '';			//Clear all inputs
			}
			var inventoryDiv = document.getElementById('inventory');
			inventoryDiv.innerHTML = '';
			outputConsole.value = '';
			activeCharacterName = undefined;
			
			break;
		case 'clearConsole':
			outputConsole.value = '';
			break;
		case 'load':
			if(command.length > 1){
				printToConsole('Loading character...');
				activeCharacterName = command[1];
				loadData(command[1]);
			}else{
				printToConsole('\'load\' needs 2nd argument.');
				return;
			}
			break;
		case 'delete':
			if(command.length > 1){
				if(characterFiles.indexOf(command[1]) < 0){
					printToConsole('Character \'' + command[1] + '\' does not exist.');
					return;
				}else{
					localStorage.removeItem(command[1] + '_char');
					characterFiles = getCharacterFiles(); 		//Update char array
					printToConsole(command[1] + ' has been deleted.');
					saveData();
				}
			}else{
				printToConsole('\'delete\' needs 2nd argument.');
				return;
			}
			break;
		case 'chars':
			var output = 'Characters:\n';
			if(characterFiles.length < 1){
				output = 'No saved characters.';
			}
			for(var i in characterFiles){
				output += '\t' + characterFiles[i] + '\n';
			}
			printToConsole(output);
			break;
		case 'setHP':
			var newHP = Number(command[1]);
		
			if(isNaN(newHP)){
				printToConsole('Error: 2nd argument of ' + command[0] + ' must be a number.');
				return;
			}
		
			inputs['hp_Input'].value = Number(newHP);
			printToConsole('HP is now ' + newHP);
			break;
		case 'heal':
			var newHP = Number(command[1]) + Number(inputs['hp_Input'].value);
		
			if(isNaN(newHP)){
				printToConsole('Error: 2nd argument of ' + command[0] + ' must be a number.');
				return;
			}
		
			inputs['hp_Input'].value = Number(newHP);
			printToConsole('HP is now ' + newHP);
			break;
		case 'damage':
			var newHP = Number(inputs['hp_Input'].value) - Number(command[1]);
		
			if(isNaN(newHP)){
				printToConsole('Error: 2nd argument of ' + command[0] + ' must be a number.');
				return;
			}
		
			inputs['hp_Input'].value = Number(newHP);
			printToConsole('HP is now ' + newHP);
			break;
		case 'roll':
			//TODO
			var results = [];
			command[1] = Number(command[1]);
			command[2] = Number(command[2]);
			
			if(command.length < 3){
				printToConsole('Error: Insufficient arguments. Usage is: \n roll <int: number of die sides> <int: number of dice>');
			}else if (isNaN(command[1]) || isNaN(command[2])){
				printToConsole('Error: Expected numerical arguments. Usage is: \n roll <int: number of die sides> <int: number of dice>');
			}else{
				for(var i = 0; i < command[2]; i++) {
					results.push(Math.floor(Math.random() * command[1]) + 1);
				}
				printToConsole(results.join(', '));
			}
			break;
		case 'addItem':
			if(command.length < 2){
				printToConsole('Error: 2nd argument needs to be an item name. \nUsage: addItem <string: Item name>.');
			}else{
				//If multiword item name, splice together rest of arguments.
				command[1] = command.slice(1).join(' ');
				
				
				//Add character and reload inventory
				activeCharacter.inventory.addItem(command[1], 0, '');
				printToConsole(' Item \'' + command[1] + '\' has been added.');
				loadInventory();
			}
			break;
		case 'removeItem':
			if(command.length < 2){
				printToConsole('Error: 2nd argument needs to be an item name. \nUsage: removeItem <string: Item name>.');
			}else{
				//Add character and reload inventory
				var wasSuccessful = activeCharacter.inventory.removeItem(command[1], 0, '');
				
				if(wasSuccessful){
					printToConsole(' Item \'' + command[1] + '\' removed.');
					loadInventory();
				}else{
					printToConsole('Error: Item \'' + command[1] + '\' does not exist.');
				}
			}
			break;
		case 'testing':
			testing();
			break;
		default:
			printToConsole("Error: '" + commandString + "' is not a valid command");
			return;
	}
	updateMisc('hp');
}

/*******************************************
			HANDLERS
*******************************************/

//If any inpute changes
function handleChange(event){
	setDirtybit();
}


//Change handlers detect when fields are changed.
function handleAbilityChange(event){
	var name = event.target.id.split('_')[0]; //Split id string to get attr name
	evaluateAbility(name);
	evaluateAc();
	evaluateGrapple();
	//Update all skills using this ability
	for (var i = 0; i < abilityToSkillsMapping[name].length; i++){
		evaluateSkill(abilityToSkillsMapping[name][i]);
	}
	
	//Update the character object
	updateAbility(name);
	updateDefense(getKey(defenseAbilityMapping, name));
	updateAc();
	updateGrapple();
	for (var i = 0; i < abilityToSkillsMapping[name].length; i++){
		updateSkill(abilityToSkillsMapping[name][i]);
	}
}

function handleDefenseChange(event){
	var name = event.target.id.split('_')[0];
	evaluateDefense(name);
	
	//Update the character object
	updateDefense(name);
}

function handleAttributeChange(event){
	var name = event.target.id.split('_')[0];
	updateAttribute(name);
}

function handleMiscChange(event){
	var name = event.target.id.split('_')[0];
	updateMisc(name);
}

function handleAcChange(event){
	evaluateAc();
	updateAc(name);
}

function handleGrappleChange(event){
	evaluateGrapple();
	updateGrapple();
}

function handleSkillChange(event){
	var name = event.target.id.split('_')[0];
	evaluateSkill(name);
	updateSkill(name);
}

function handleInventoryChange(event){
	var itemName = event.target.id.split('_')[0];
	evaluateInventoryEntry(itemName);
	updateInventory(itemName);
	loadInventory();
}

//Handler for detecting keyboard input
function handleCommandEntry(event){
	if(event.which == 13){
		var command = strip(commandBox.value);
		if(command == ''){
			return;
		}else{
        	executeCommand(command);
        	commandLineHistory.push(command);
        	commandLineCursor = commandLineHistory.length;
        	mostRecentCommand = '';
       		commandBox.value = '';				//Clear input
       	}
	//Up arrow
    }else if(event.which == 38){    	
    	event.preventDefault();
    	if(commandLineHistory.length == 0){
    		return;
    		//Record current if going from most recent
    	}else if(commandLineCursor >= commandLineHistory.length){
			mostRecentCommand = commandBox.value;
		}
    	//On earliest command. Cannot go back any further in history.
    	if(commandLineCursor < 1){
    		commandLineCursor = 0;
    		commandBox.value = commandLineHistory[0];
    	}else{
    		//Otherwise, go back in history.
    		commandLineCursor -= 1;
    		commandBox.value = commandLineHistory[commandLineCursor];
    	}
	//Down arrow
    }else if(event.which == 40){
    	event.preventDefault();
    	//On most recent command. Cannot go any further
    	if(commandLineCursor >= commandLineHistory.length){
    		commandBox.value = mostRecentCommand;
    	}else{
    		//Otherwise, go forward in history.
    		commandLineCursor += 1;
    		if(commandLineCursor == commandLineHistory.length){
    			commandBox.value = mostRecentCommand;
    		}else{
				commandBox.value = commandLineHistory[commandLineCursor];
			}
    	}
    }
}

/////
//JQUERY HANDLERS
/////

//Handle toggling skill hide/show
function handleHideShow(){
	$('#skills').toggle();
}

//Disable newlines
function handleNewlineDisable(event){
	if(event.which == 13){
		event.preventDefault();
		event.target.blur();
		handleInventoryChange(event);
	}
}

/*******************************************
			CONSTRUCTORS
*******************************************/
function Character(name){
	if(name === undefined){	//Set default name if none given
		name = 'Untitled';
	}
	this.hp			= 0;
	this.hpMax		= 0;
	this.lv			= 0;
	this.gp			= 0;
	this.sp			= 0;
	this.cp			= 0;
	this.ability 	= {};
	this.attribute	= {'name':name};
	this.defense	= {};
	this.ac 		= {armor:0, shield:0, sizeMod:0, natural:0, misc:0, mod:0, total:0};
	this.grapple	= {attack:0, size:0, misc:0, mod:0, total:0};
	this.fileVersion= formatVersion;
	this.skills		= {};
	this.inventory	= new Inventory();
	
	for(var i = 0; i < abilityNames.length; i++){
		this.ability[abilityNames[i]] = new Ability(abilityNames[i]);
	}
	
	for(var i = 0; i < defenseNames.length; i++){
		this.defense[defenseNames[i]] = new Defense(defenseNames[i]);
	}
	
	for(var i = 0; i < attributeNames.length; i++){
		this.attribute[attributeNames[i]] = '';
	}
	
	for(var skill in skillAbilityMapping){
		this.skills[skill] = new Skill(skill, skillAbilityMapping[skill]);
	}
}

function Ability(name){
	this.name 	= name;
	this.total	= 0;
	this.base	= 0;
	this.bonus	= 0
	this.penal	= 0;
	this.mod	= 0;
}

function Defense(name){
	this.name 	= name;
	this.total	= 0;
	this.base	= 0;
	this.mod	= 0;
	this.misc	= 0;
}

function Attribute(name){
	this.name	= 0;
	this.value	= '';
}

function Item(name, quantity, description, obj){
	this.name = name;
	this.description = description;
	this.quantity = quantity;
		
	//Print self as HTML from template
	this.toHTML = function(templateString){
		var output = replaceAll('{name}', this.name, templateString);
		output = replaceAll('{description}', this.description, output);
		output = replaceAll('{quantity}', this.quantity, output);
		
		return output;
	};
	
	//From JSON object
	if(obj){
		for(var prop in obj){
			this[prop] = obj[prop];
		}
	}
}

function Skill(name, abilityMapping){
	this.name = name;
	this.ability = abilityMapping;
	this.trained = false;
	this.total = 0;
	this.ranks = 0;
	this.mod = 0;
	this.misc = 0;
}

function Inventory(obj){
	this.items = {};
	
	//Add an item to the inventory. 
	this.addItem = function(name, quantity, description){
		var newItem = new Item(name, quantity, description);
		this.items[newItem.name] = newItem;
	};
	
	//Remove an item from the list by name
	this.removeItem = function(itemName){
		//Check if exists
		if(this.isInInventory(itemName)){
			delete this.items[itemName];
			return true;
		}else{
			return false;
		}
	};
	
	//Check if item exists in list.
	this.isInInventory = function(itemName){
		for(var item in this.items){
			if(item == itemName){
				return true;
			}
		}
		return false;
	};
	
	//Create html representation
	this.toHTML = function(){
		var output = '';
		for(var item in this.items){
			output += (this.items[item]).toHTML(itemInvTemplate);
		}
		return output;
	};
	
	//From JSON object
	if(obj){
		for(var prop in obj){
			this[prop] = obj[prop];
		}
	}
}

/*******************************************
	MODEL FUNCTIONS: Functions for loading
	and storing from the  character object
*******************************************/

//Methods used to update the character object//
function updateDefense(name){
	var defense = activeCharacter.defense[name];
	for (key in defense) {
		if(key == 'name'){
			continue;			//Skip'name' since it doesn't exist
		}
		var inputName = name + '_' + capitalize(key) + 'Input';
		defense[key] = Number(inputs[inputName].value);
	}
}

function updateAbility(name){
	var ability = activeCharacter.ability[name];
	for (key in ability) {
		if(key == 'name'){
			continue;			//Skip'name' since it doesn't exist
		}
		var inputName = name + '_' + capitalize(key) + 'Input';
		ability[key] = Number(inputs[inputName].value);
	}
}

function updateAttribute(name){
	var inputName = name + '_Input';
	activeCharacter.attribute[name] = inputs[inputName].value;
}

function updateMisc(name){
	var inputName = name + '_Input';
	var newValue  = inputs[inputName].value;
	//Special conditions for numerical fields
	//TODO: Find better way of checking for this
	
	//Check if number
	if(	name == 'hp' || name == 'hpMax' || name == 'lv' || 
		name == 'gp' || name == 'sp' || name == 'cp'){
			if(isNaN(Number(newValue))){
				alert('Error: Expected numerical value for ' + name + '.');
				return false;
			}
	}
	//Make sure money isn't negative.
	if(name == 'gp' || name == 'sp' || name == 'cp'){
		if(Number(newValue) < 0){
			newValue = 0;
			loadMisc(name);
		}
	}
	
	activeCharacter[name] = newValue;
}

function updateAc(){
	//fetch values
	activeCharacter.ac['armor'] 	= Number(inputs['ac_ArmorBonusInput'].value);
	activeCharacter.ac['shield']	= Number(inputs['ac_ShieldBonusInput'].value);
	activeCharacter.ac['sizeMod']	= Number(inputs['ac_SizeModInput'].value);
	activeCharacter.ac['natural']	= Number(inputs['ac_NaturalArmorInput'].value);
	activeCharacter.ac['deflect']	= Number(inputs['ac_DeflectionInput'].value);
	activeCharacter.ac['misc']		= Number(inputs['ac_MiscInput'].value);
	activeCharacter.ac['mod']		= Number(inputs['ac_ModInput'].value);
	activeCharacter.ac['total']		= Number(inputs['ac_TotalInput'].value);
}

function updateGrapple(){
	//fetch values
	activeCharacter.grapple['attack'] 	= Number(inputs['grapple_BaseAttackInput'].value);
	activeCharacter.grapple['size']	=  Number(inputs['grapple_SizeModInput'].value);
	activeCharacter.grapple['misc']	= Number(inputs['grapple_MiscInput'].value);
	activeCharacter.grapple['mod']	= Number(inputs['grapple_ModInput'].value);
	activeCharacter.grapple['total']	= Number(inputs['grapple_TotalInput'].value);
}

function updateSkill(name){
	//If skill hasn't been created yet, instantiate it.
	if(activeCharacter.skills[name] === undefined){
		activeCharacter.skills[name] = new Skill(name, skillAbilityMapping[name]);
	}
	var skillToUpdate = activeCharacter.skills[name];
	
	skillToUpdate['trained'] 	= inputs[name + '_TrainedInput'].checked;
	skillToUpdate['total']		= Number(inputs[name + '_TotalInput'].value);
	skillToUpdate['ranks']		= Number(inputs[name + '_RanksInput'].value);
	skillToUpdate['mod']		= Number(inputs[name + '_ModInput'].value);
	skillToUpdate['misc']		= Number(inputs[name + '_MiscInput'].value);
}

function updateInventory(name){
	var updatedItem = activeCharacter.inventory.items[name];
	//Item hasn't been added to the charater object yet
	if(updatedItem === undefined){
		return false;
	}
	updatedItem.quantity = inputs[name + '_ItemQuantity'].innerHTML;
	updatedItem.description = inputs[name + '_ItemDescription'].innerHTML;
}

//Methods used to load data from the character to the form//
function loadDefense(name){
	var defense = activeCharacter.defense[name];
	for (key in defense) {
		if(key == 'name'){
			continue;			//Skip'name' since it doesn't exist
		}
		var inputName = name + '_' + capitalize(key) + 'Input';
		inputs[inputName].value = Number(defense[key]);
	}
}

function loadAbility(name){
	var ability = activeCharacter.ability[name];
	for (key in ability) {
		if(key == 'name'){
			continue;			//Skip'name' since it doesn't exist
		}
		var inputName = name + '_' + capitalize(key) + 'Input';
		inputs[inputName].value = Number(ability[key]);
	}
}

function loadAttribute(name){
	var inputName = name + '_Input';
	inputs[inputName].value = activeCharacter.attribute[name];
}

function loadMisc(name){
	var inputName = name + '_Input';
	inputs[inputName].value = activeCharacter[name];
}

function loadAc(){
	//fetch values
	inputs['ac_ArmorBonusInput'].value 	= Number(activeCharacter.ac['armor']);
	inputs['ac_ShieldBonusInput'].value	= Number(activeCharacter.ac['shield']);
	inputs['ac_SizeModInput'].value	= Number(activeCharacter.ac['sizeMod']);
	inputs['ac_NaturalArmorInput'].value = Number(activeCharacter.ac['natural']);
	inputs['ac_DeflectionInput'].value = Number(activeCharacter.ac['deflect']);
	inputs['ac_MiscInput'].value = Number(activeCharacter.ac['misc']);
	inputs['ac_ModInput'].value	= Number(activeCharacter.ac['mod']);
	inputs['ac_TotalInput'].value = Number(activeCharacter.ac['total']);
}

function loadGrapple(){
	inputs['grapple_BaseAttackInput'].value = Number(activeCharacter.grapple['attack']);
	inputs['grapple_SizeModInput'].value =  Number(activeCharacter.grapple['size']);
	inputs['grapple_MiscInput'].value = Number(activeCharacter.grapple['misc']);
	inputs['grapple_ModInput'].value = Number(activeCharacter.grapple['mod']);
	inputs['grapple_TotalInput'].value = Number(activeCharacter.grapple['total']);
}

function loadSkill(name){
	//Check if Exists, and creat if it doesn't
	if(activeCharacter.skills[name] === undefined){
		activeCharacter.skills[name] = new Skill(name, skillAbilityMapping[name]);
	}
	
	var skillToLoad = activeCharacter.skills[name];
	
	inputs[name + '_TrainedInput'].checked 	= skillToLoad['trained'];
	inputs[name + '_TotalInput'].value		= Number(skillToLoad['total']);
	inputs[name + '_RanksInput'].value		= Number(skillToLoad['ranks']);
	inputs[name + '_ModInput'].value		= Number(skillToLoad['mod']);
	inputs[name + '_MiscInput'].value		= Number(skillToLoad['misc']);
}

function loadInventory(){
	var inventoryDiv = document.getElementById('inventory');
	inventoryDiv.innerHTML = activeCharacter.inventory.toHTML();
	
	//Load in div inputs into inputs since they aren't loading during the input loading phase
	//TODO Find way around this to make more elegant
	var divInputElements = document.getElementsByClassName('itemInput');
	for(var i = 0; i < divInputElements.length; i++){
		inputs[divInputElements[i].id] = divInputElements[i] ;		//Arrange by name
	}
	
	//Reattach listeners
	$('.itemInput').keypress(handleNewlineDisable);
}

/*******************************************
	MODEL FUNCTIONS: Functions used in
	accessing and saving to local storage
*******************************************/
function saveData(filename){
	localStorage.setItem('lastUsedChar', JSON.stringify(activeCharacter));
	if(filename != undefined){							//Filename given, save a file∀
		localStorage.setItem(filename + '_char', JSON.stringify(activeCharacter));
		characterFiles = getCharacterFiles();			//Add to array if not already
	}
}

function loadData(filename){
	characterFiles = getCharacterFiles();		//Update array
	var characterData;
	if(filename != undefined){					//If asking for specific character
		if(characterFiles.indexOf(filename) < 0){
			printToConsole('Character \'' + filename + '\' not found.');
			return;
		}else{
			characterData = localStorage[filename + '_char'];
		}
	}else{										//None specified, use default
		characterData = localStorage['lastUsedChar'];
	}
	
	if(characterData){								//Check if last-used character
		characterData = JSON.parse(characterData);
	}else{
		activeCharacter = new Character();			//If not make a clear one.
		return;
	}

	activeCharacter = characterData;				//Make active Character
	
	if(checkIfUpdate()){							//Check if updates needed
		printToConsole('Update needed. Updating from file format from version' + activeCharacter.fileVersion + ' to' + formatVersion);
		updateActiveCharacter();
		saveData(filename);
	}
	
	//Re-construct Objects from JSON string to retain methods
	activeCharacter.inventory = new Inventory(activeCharacter.inventory);
	for(var item in activeCharacter.inventory.items){
		activeCharacter.inventory.items[item] = new Item(0,0,0, activeCharacter.inventory.items[item]);
	}
	
	//Load data here
	for(var i in abilityNames){
		loadAbility(abilityNames[i]);
	}
	for(var i in defenseNames){
		loadDefense(defenseNames[i]);
	}
	for(var i in attributeNames){
		loadAttribute(attributeNames[i]);
	}
	for(var i in miscNames){
		loadMisc(miscNames[i]);
	}
	loadAc();
	loadGrapple();
	
	for(var skill in skillAbilityMapping){
		loadSkill(skill);
	}
	loadInventory();
}

/*******************************************
	UPDATE CHARACTER FILE IF UPDATE
	TO APP
*******************************************/
//Check if update needed. Return'true' if update needed.
function checkIfUpdate(){
	if(Number(activeCharacter.fileVersion) == Number(formatVersion)){
		return false;
	}else{
		return true;
	}
}

//Update the active character to current format
function updateActiveCharacter(){
	//Case structure updates from oldest to newest formats
	switch (activeCharacter.fileVersion){
		case 1.0:
			//
		case 1.1:
			//
		case 1.2:						//Add skills and inventory to character
			activeCharacter.skills = {};
			activeCharacter.inventory = new Inventory();
			activeCharacter.gp			= 0;
			activeCharacter.sp			= 0;
			activeCharacter.cp			= 0;
		case 1.3:
			//Current version
		default:
			break;
	}
	activeCharacter.fileVersion = formatVersion;
	return;
}

/*******************************************
					MAIN
*******************************************/

window.onload = function init(){
	//Grab important elements
	appContainer = document.getElementById('appContainer');
	abilityContainer = document.getElementById('abilityContainer');
	skills = document.getElementById('skills');
	attributes = document.getElementById('attributes');
	commandBox = document.getElementById('commandBox');
	outputConsole = document.getElementById('outputConsole'); loadingBox
	loadingBox = document.getElementById('loadingBox');
	
	//Load fields
	loadElementsAttributes(abilityNames, defenseNames, attributeNames, skillAbilityMapping);
	//Grab inputs
	loadElementsInputs();
	
	//All elements have been loaded at this point
	//Load character data
	loadData();
	
	//Attach listeners to auto-updating fields
	loadInputListeners();
	
	//Attach any other listeners
	attachListeners();
	
	//Set up jQuery tooltips
	$(document);
	
	//Get back command line history if it exists
	var commandLine = localStorage['commandLineHistory'];
	if(commandLine){
		commandLineHistory = JSON.parse(commandLine);
		commandLineCursor = commandLineHistory.length;
	}
	
	//Set up visibility of elements after loading is done.
//	$('#skills').hide();
	loadingBox.style.display = 'none'; 
	appContainer.style.display = 'inline-block';
}
