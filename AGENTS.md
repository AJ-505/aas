Do not mock any data directly. For any flow you want to mock, put the data directly inside of Convex, and then use the data directly there. That way we can ensure that there is little drift between the demo and what's coming from our DB.
Edit ROADMAP.md as necessary - it's the roadmap we are using to track how far we've come to implementing all the features in our PRD.
As much as possible, utilise nohup to background bash tools so that you can continue working and dont get blocked waiting for the commands to continue. Just remember to go and take a look at the results of the bash operations! Utilise todolilsts and any other tools that can help you to keep track of those jobs. Also background subagents as well in that fashion.
If you are in the opencode harness, do NOT spawn their harness-native subagents. Instead, run the opencode CLI inside of bash (using nohup to background it as much as possible as earlier described) so that you can have more granular control over the agents.

Links:
- Tanstack router instructions: docs/tanstack-router-guidelines.md
