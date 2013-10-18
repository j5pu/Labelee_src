Feature: Login User
    Scenario: Login staff user
        Given A staff user created with username "mnopi" and password "1234"
        When I go to "/map-editor/" URL
        And I fill in "username" with "mnopi"
        And I fill in "password" with "1234"
        And I press the login button
        Then I go to the "/map-editor/" index page