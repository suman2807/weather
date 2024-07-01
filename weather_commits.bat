@echo off
setlocal enabledelayedexpansion

for %%m in (07 08) do (

    for /L %%d in (1,1,31) do (

        REM ~50% chance (ensures ~15 active days)
        set /a chance=!random! %% 10
        if !chance! GEQ 5 (

            REM 1 to 6 commits per day
            set /a commits=!random! %% 6 + 1

            for /L %%c in (1,1,!commits!) do (

                set day=%%d
                if !day! LSS 10 set day=0!day!

                REM realistic working hours
                set /a hour=!random! %% 12 + 9
                set /a min=!random! %% 60

                echo %%m-%%d-%%c >> file.txt
                git add .

                set DATE=2024-%%m-!day! !hour!:!min!:00
                set GIT_AUTHOR_DATE=!DATE!
                set GIT_COMMITTER_DATE=!DATE!

                REM Weather app realistic commits
                set /a r=!random! %% 12

                if !r! EQU 0 git commit -m "initialized weather app project"
                if !r! EQU 1 git commit -m "integrated weather API"
                if !r! EQU 2 git commit -m "fetched real-time weather data"
                if !r! EQU 3 git commit -m "implemented temperature display UI"
                if !r! EQU 4 git commit -m "added city search functionality"
                if !r! EQU 5 git commit -m "handled API errors and edge cases"
                if !r! EQU 6 git commit -m "improved UI design and responsiveness"
                if !r! EQU 7 git commit -m "added loading spinner for API calls"
                if !r! EQU 8 git commit -m "optimized API request performance"
                if !r! EQU 9 git commit -m "added weather icons and visuals"
                if !r! EQU 10 git commit -m "refactored code structure"
                if !r! EQU 11 git commit -m "updated README documentation"
            )
        )
    )
)