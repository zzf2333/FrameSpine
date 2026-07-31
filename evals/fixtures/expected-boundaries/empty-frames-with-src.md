# Injected Failure: Empty Frames With Src

Agent or harness presents storyboard cards that all have renderable `src`, but canvas content is:

- empty white cards
- three equal boxes meaning “results”
- one circle meaning “person”
- a row of squares meaning “data”

Expected eval result: **fail Frame Canvas + Sequence**, even though Surface src checks might look green.
