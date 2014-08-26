<!-- DUMMY PAGE --!>
<!DOCTYPE html>
<html lang="en"
	  xmlns="http://www.w3.org/1999/xhtml"
      xmlns:fb="http://ogp.me/ns/fb#">
<head>
	<meta charset="utf-8"/>
		<meta property="og:image" content='resources/Images/Alex/conducting.jpg' />
<link rel='description' href='resources/Images/Alex/conducting.jpg'/>
<meta name="keywords" content="Alexander Stein, portfolio, projects" />
<meta name="description" content="The portfolio of Alexander Stein" />
<meta name="author" content="Alexander Stein" />
<meta name="copyright" content="&copy; 2013" />	
<link rel="stylesheet/less" type="text/css" href="resources/CSS/main.css"/>
<link rel="stylesheet/less" type="text/css" href="resources/CSS/char.css?version=100"/>

<script src="resources/scripts/require.js"></script>
<script src="resources/scripts/main.js"></script>
<script src="resources/scripts/char.js"></script>

<title>Alexworks</title>
<body id='body' style='visibility: hidden; '>
<nav  id="navigation">
    <ul>
    	<span id='logo'>
			<a href=""><li>Alexworks</li></a>
		</span>
		<span id='links'>
			<a href="main/about/"><li>About-Meta</li></a><a href="main/projects/"><li>Projects</li></a><a href="main/music/"><li>Music</li></a>		</span>
		<span id='hamburgerSection'>
			<li id="hamburger"><img src=".//resources/Images/icons/hamburger.png" alt="Menu" class="iconSmall"/>		</span>
        </li>
    </ul>
	<div id="hamburgerMenu" style="display:none">
		<div id="controls">
			<img height="35" width="35" class="textControls" id="smallTextButton" src="resources/Images/icons/TextIconSmall.png" alt="Small">
			<img height="35" width="35" class="textControls" id="medTextButton" src="resources/Images/icons/TextIconMed.png" alt="Medium">
			<img height="35" width="35" class="textControls" id="largeTextButton" src="resources/Images/icons/TextIcon.png" alt="Large">
		</div>
		<p>Table of Contents<p>
		<ul id="tableOfContents">
			<li>No contents to display</li>
		</ul>
	</div>
</nav>


<!-- DEVELOP HERE  --!>
	<!-- DnD Character Manager Code-->
	<section id='DnD_Character_Manager'>
		<h2>DnD Character Manager</h2>
		<div id='loadingBox'> Loading...</div>
		<div id='appContainer'>
			<div id='rightPanel'>
				<div id='commandBoxContainer'>
					<input id='commandBox' type='text' placeholder="Command Box."></input></br>
					<textarea rows='8' readonly id='outputConsole' placeholder="Console Output. Enter 'help' into the command box for a list of commands!"></textarea>
				</div>
				<div id='inventoryContainer'>
					<div id='money'>
						<span id='gpContainer'  class='characterAttr moneyContainer'>
							<span class='attrName'>GP</span>
								<input id='gp_Input' class='misc_Input money_Input' type='text'></input>					
						</span>
						<span id='spContainer'  class='characterAttr moneyContainer'>
							<span class='attrName'>SP</span>
								<input id='sp_Input' class='misc_Input money_Input' type='text'></input>					
						</span>
						<span id='cpContainer'  class='characterAttr moneyContainer'>
							<span class='attrName'>CP</span>
								<input id='cp_Input' class='misc_Input money_Input' type='text'></input>					
						</span>

					</div>
					<div id='inventoryInfo' class='item characterAttr'>
						<span id='' class='itemAttr itemName'>Item Name</span>
						<span id='' class='itemAttr itemQuantity'>Quan.</span>
						<span id='' class='itemAttr itemDescription'>Description</span>
					</div>
					<div id='inventory'>
						<!-- JS fills in things here. !-->
					</div>
				</div>
			</div>
			<div id='attributesContainer'>
				<div id="attributes">
				<!-- JS Fills in the stuff here 
					Attributes:
						'name', 'class', 'race', 'align', 'gender'
				!-->
				</div>
				<div id='hitpointlvContainer' class=''>
					<span id='hpContainer'  class='characterAttr'>
						<span class='attrName'>HP</span>
							<input id='hp_Input' class='misc_Input' type='text'></input>/
							<input id='hpMax_Input' class='misc_Input'  type='text' placeholder='Max'></input>
					</span>
					<span id='lvContainer'  class='characterAttr'>	
						<span class='attrName'>Lv</span><input id='lv_Input' class='misc_Input' type='text'></input>
					</span>
				</div>
			</div>
			<div id='abilityContainer'>
				<!-- JS Fills in the stuff here 
					Attributes:
						'str', 'dex', 'con', 'int', 'wis', 'cha'
						'for', 'ref', 'will'
				!-->
			</div>
			<div id='acContainer'>
				<div id='ac' class='characterAttr'>
					<span class='attrName'>AC</span>
						<input id='ac_TotalInput' class='ac totalBox' readonly placeholder='Total' type='text'></input> = 10 + 
						<input id='ac_ArmorBonusInput' class='ac ac_Input' placeholder='Armor' type='text'></input> + 
						<input id='ac_ShieldBonusInput' class='ac ac_Input' placeholder='Shield' type='text'></input> + 
						<input id='ac_ModInput' class='ac totalBox' readonly placeholder='DEX' type='text'></input> + 
						<input id='ac_SizeModInput' class='ac ac_Input' placeholder='Size' type='text'></input> +
						<input id='ac_NaturalArmorInput' class='ac ac_Input' placeholder='Natural' type='text'></input> +
						<input id='ac_DeflectionInput' class='ac ac_Input' placeholder='Defl.' type='text'></input> + 
						<input id='ac_MiscInput' class='ac ac_Input' placeholder='Misc.' type='text'></input>
				</div>
				<div id='grapple' class='characterAttr'>
					<span class='attrName'>Grap.</span>
						<input id='grapple_TotalInput' class='grapple totalBox' readonly placeholder='Total' type='text'></input> = 10 + 
						<input id='grapple_BaseAttackInput' class='grapple grapple_input' placeholder='Base Atk' type='text'></input> + 
						<input id='grapple_ModInput' class='grapple totalBox' readonly placeholder='STR' type='text'></input> + 
						<input id='grapple_SizeModInput' class='grapple grapple_input' placeholder='Size' type='text'></input> +
						<input id='grapple_MiscInput' class='grapple grapple_input' placeholder='Misc.' type='text'></input>		
				</div>
			</div>
			<div id='skillsExpandHide' class='characterAttr expandHide'> Expand/Hide Skills
			</div>
			<div id='skillContainer'>
				<div id='skills'>
					<!-- JS Fills in the stuff here 
						Attributes:
							'str', 'dex', 'con', 'int', 'wis', 'cha'
							'for', 'ref', 'will'
					!-->
				</div>
			</div>
		</div>	
	</section>
<!--END OF DEV AREA --!>

<div id="adBottom">
	
</div>
<footer id="footer">
	Copyright &copy; 2014 Alexander Stein
</footer>
</body>
</html>
