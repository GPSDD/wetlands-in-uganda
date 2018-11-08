@echo off

set path=%path%;node_modules\.bin

cls
:start
echo.
echo DHI Web Components
echo 1. Vulcanize
echo 2. Update All
echo 3. Install Polymer and Elements
echo 4. Install Bower and Vulcanize
echo 5. Vulcanize Current Project
echo.
echo To get things running you need
echo    Install node.js from http://nodejs.org/
echo    Install Git from http://git-scm.com/download/win. 
echo.
set /p choice=Make your choice. 
if '%choice%'=='1' goto vulcanize
if '%choice%'=='2' goto update
if '%choice%'=='3' goto install
if '%choice%'=='4' goto installbase
if '%choice%'=='5' goto vulcanizecurrentprojects
echo.
goto start
:vulcanize
	echo var compileddateTime = '%date% %time%'; > js\compileddateTime.js
	set index=1

	SETLOCAL ENABLEDELAYEDEXPANSION
	FOR %%f IN (*.html) DO (
		SET file!index!=%%f
		ECHO !index! - %%f
		SET /A index=!index!+1
	)

	SETLOCAL DISABLEDELAYEDEXPANSION

	SET /P selection="Select file by number:"

	SET file%selection% >nul 2>&1

	IF ERRORLEVEL 1 (
		ECHO invalid number selected   
		EXIT /B 1
	)

	CALL :resolve %%file%selection%%%

	echo Vulcanizing %filename% > index.html

	call vulcanize --inline-scripts --inline-css %filename% > index.html
	
	goto end

	:resolve
	SET filename=%1
	goto end
:update
	call npm update bower
	call npm update vulcanize
	bower update
	goto end
:install
	call bower install --save Polymer/polymer
	call bower install --save PolymerElements/iron-elements
	call bower install --save PolymerElements/paper-elements
	call bower install --save google-analytics
	goto end
:installbase
	call npm install -g bower
	call npm install -g vulcanize
	goto end
:vulcanizecurrentprojects
	call vulcanize --inline-scripts --inline-css index.html > vulcanized\index.html
:end
pause
