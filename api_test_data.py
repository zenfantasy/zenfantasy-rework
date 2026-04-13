# %%
## Getting a list of all matches
import requests
import pandas as pd
import time

# --- CONFIG ---
URL = "https://cricket-live-line-advance.p.rapidapi.com/competitions/129908/matches"

HEADERS = {
    "x-rapidapi-key": "a1cb1855cdmshe96d10b1934764cp1ee786jsnbaee01b7b84c",
    "x-rapidapi-host": "cricket-live-line-advance.p.rapidapi.com",
    "Content-Type": "application/json"
}

PARAMS = {
    "paged": "1",
    "per_page": "50"
}

# --- STEP 1: INITIAL CALL TO GET TOTAL PAGES ---
response = requests.get(URL, headers=HEADERS, params=PARAMS)

if response.status_code != 200:
    raise Exception(f"HTTP Error {response.status_code}: {response.text}")

data = response.json()

if 'response' not in data:
    raise Exception(f"API Error: {data}")

total_pages = int(data['response']['total_pages'])
print(f"Total pages: {total_pages}")

# --- STEP 2: LOOP ALL PAGES ---
all_matches = []

for page in range(1, total_pages + 1):
    print(f"Fetching page {page}...")
    
    PARAMS['paged'] = str(page)
    
    response = requests.get(URL, headers=HEADERS, params=PARAMS)
    
    if response.status_code != 200:
        print(f"Skipping page {page}, error: {response.status_code}")
        continue
    
    data = response.json()
    
    if 'response' not in data:
        print(f"Skipping page {page}, invalid structure")
        print(data)
        continue
    
    matches = data['response']['items']
    all_matches.extend(matches)
    
    time.sleep(1)  # avoid rate limits

print(f"\nTotal matches fetched: {len(all_matches)}")

# --- STEP 3: FLATTEN JSON ---
df = pd.json_normalize(all_matches, sep="_")

# --- STEP 4: SELECT CLEAN COLUMNS ---
cols_to_keep = [
    'match_id', #to use for match info api later
    'title', #full title with full team names
    'short_title', #short title with short team names [RCB vs SRH]
    'match_number', #match number in the season [e.g. 1, 2, 3...]
    'status_str', #once the match is "Live" need to call the match infor api every 10 mins to get the latest stats
    'status_note', #current state in a live match; should display for live matches [e.g. "SRH need 20 runs in 12 balls"]
    'date_start_ist', #we will use this date and time to call the match info api 25 mins before to map squads etc and then every 10 mins for live matches; also to display the match start time in the app

    # Team A
    'teama_team_id', #to use for match info api later
    'teama_name', #full team name [e.g. Royal Challengers Bangalore]
    'teama_short_name', #short team name [e.g. RCB]
    'teama_logo_url', #the url destination has an .png image which we can use in the app for better UX
    'teama_scores', #can use for past matches and live matches; for upcoming matches this will be null
    'teama_overs', #can use for past matches and live matches; for upcoming matches this will be null

    # Team B
    'teamb_team_id', #to use for match info api later
    'teamb_name', #full team name [e.g. Chennai Super Kings]
    'teamb_short_name', #short team name [e.g. CSK]
    'teamb_logo_url', #the url destination has an .png image which we can use in the app for better UX
    'teamb_scores', #can use for past matches and live matches; for upcoming matches this will be null
    'teamb_overs', #can use for past matches and live matches; for upcoming matches this will be null

    # Result
    'result', #can use for past matches; for live and upcoming matches this will be null
    'winning_team_id', 

    # Venue
    'venue_venue_id', #just fyi
    'venue_name', #to show along with match teams, start time etc in the app
    'venue_location', #to show along with match teams, start time etc in the app

    # Toss
    'toss_text' #to show along with match teams, start time etc in the app for live matches
]

df_clean = df[cols_to_keep]

# --- STEP 5: TYPE FIXES ---
df_clean['match_id'] = df_clean['match_id'].astype(int)

# --- STEP 6: PREVIEW ---
print("\nColumns:")
print(df_clean.columns.tolist())

print("\nHead:")
print(df_clean.head())

# --- STEP 7: SAVE ---
df_clean.to_csv("ipl_matches.csv", index=False)

print("\nSaved to ipl_matches.csv")

# %%
#getting squads

import requests
import pandas as pd
import time

# --- CONFIG ---
URL = "https://cricket-live-line-advance.p.rapidapi.com/competitions/129908/squads"

HEADERS = {
    "x-rapidapi-key": "a1cb1855cdmshe96d10b1934764cp1ee786jsnbaee01b7b84c",
    "x-rapidapi-host": "cricket-live-line-advance.p.rapidapi.com",
    "Content-Type": "application/json"
}

# --- STEP 1: API CALL ---
response = requests.get(URL, headers=HEADERS)

if response.status_code != 200:
    raise Exception(f"HTTP Error {response.status_code}: {response.text}")

data = response.json()

if 'response' not in data:
    raise Exception(f"API Error: {data}")

squads = data['response']['squads']

print(f"Total teams fetched: {len(squads)}")

# --- STEP 2: FLATTEN TEAM + PLAYER ---
all_players = []

for squad in squads:
    team_info = squad.get('team', {})
    
    team_id = squad.get('team_id')
    team_name = squad.get('title')
    team_abbr = team_info.get('abbr')

    players = squad.get('players', [])
    
    for player in players:
        row = {
            # --- TEAM ---
            'team_id': team_id, #to map it to teams correctly from other APIs later
            'team_name': team_name, #full team name [e.g. Royal Challengers Bangalore]
            'team_abbr': team_abbr, #short team name [e.g. RCB]
            
            # --- PLAYER ---
            'player_id': player.get('pid'), #unique player id to map data from match info api later
            'player_name': player.get('title'), #full player name [e.g. Virat Kohli]
            'short_name': player.get('short_name'), #we can use this for better UI in the app instead of long names for players like "Harshal Patel" -> "H. Patel"
            
            # --- ROLE ---
            'role': player.get('playing_role'), #wk, bat, all, bowl - we will map this to WK, BAT, AR, BOWL in the app
            
            # --- SKILLS ---
            'batting_style': player.get('batting_style'), #e.g. "Right-hand bat"
            'bowling_style': player.get('bowling_style'), #e.g. "Right-arm medium"
            
            # --- META ---
            'country': player.get('country'), #e.g. "India"; If country is not "India", mark as overseas player in the app
            'birthdate': player.get('birthdate'), #optional to show age in the app 
            
            # --- FANTASY ---
            'fantasy_rating': player.get('fantasy_player_rating'), #we will use this to calculate the credits for players in the app; we will do a min-max normalization to map the fantasy ratings to credits between 6 and 11 in the app
            
            # --- OPTIONAL (useful later) ---
            'nationality': player.get('nationality'), #e.g. "Indian", "Australian"; we can use this to show the flag of the country in the app for better UX
            'profile_image_url': player.get('profile_image') #the url destination has an .png image which we can use in the app for better UX
        }
        
        all_players.append(row)

print(f"Total players fetched: {len(all_players)}")

# --- STEP 3: DATAFRAME ---
df = pd.DataFrame(all_players)

# --- STEP 4: CLEAN TYPES ---
df['player_id'] = df['player_id'].astype(int)
df['team_id'] = df['team_id'].astype(int)

role_map = {
    'wk': 'WK',
    'bat': 'BAT',
    'all': 'AR',
    'bowl': 'BOWL'
}

df['role'] = df['role'].map(role_map)
df['fantasy_rating'] = pd.to_numeric(df['fantasy_rating'], errors='coerce')
min_rating = df['fantasy_rating'].min()
max_rating = df['fantasy_rating'].max()

df['credit_raw'] = 6 + (df['fantasy_rating'] - min_rating) * (11 - 6) / (max_rating - min_rating)
df['credit'] = (df['credit_raw'] * 2).round() / 2
df['credit'] = df['credit'].clip(6, 11)

# --- STEP 5: PREVIEW ---
print("\nColumns:")
print(df.columns.tolist())

print("\nHead:")
print(df.head())

# --- STEP 6: SAVE ---
df.to_csv("ipl_squads.csv", index=False)

print("\nSaved to ipl_squads.csv")

# %%
#getting live match data

import requests
import pandas as pd
import time

# ---------- CONFIG ----------
API_KEY = "a1cb1855cdmshe96d10b1934764cp1ee786jsnbaee01b7b84c"
MATCH_ID = "95842"

URL = f"https://cricket-live-line-advance.p.rapidapi.com/matches/{MATCH_ID}/info"

HEADERS = {
    "x-rapidapi-key": API_KEY,
    "x-rapidapi-host": "cricket-live-line-advance.p.rapidapi.com",
    "Content-Type": "application/json"
}

# ---------- HELPERS ----------
def to_int(x):
    try:
        return int(x)
    except:
        return None

def to_float(x):
    try:
        return float(x)
    except:
        return None

def to_bool(x):
    if isinstance(x, bool):
        return x
    if isinstance(x, str):
        return x.lower() in ["true", "1", "yes"]
    return None


# ---------- API CALL ----------
def fetch_match_data(match_id):
    url = f"https://cricket-live-line-advance.p.rapidapi.com/matches/{match_id}/info"

    for attempt in range(3):
        response = requests.get(url, headers=HEADERS)

        if response.status_code == 200:
            data = response.json()

            if 'response' not in data:
                raise Exception(f"API structure error: {data}")

            return data['response']

        print(f"Retry {attempt+1} failed: {response.status_code}")
        time.sleep(1)

    raise Exception("API failed after retries")


# ---------- PARSER ----------
def parse_match_data(data):

    match_id = to_int(data.get("match_id"))

    # ---------------- MATCH MASTER ----------------
    match_master = {
        "match_id": match_id, #to map to other APIs
        "status_str": data.get("status_str"), #can use to display the current status of the match in the app [e.g. "Live", "Finished", "Upcoming"]
        "status_note": data.get("status_note"), #current state in a live match; should display for live matches [e.g. "SRH need 20 runs in 12 balls"]
        "game_state_str": data.get("game_state_str"), #e.g. "In Progress", "Completed"
        "equation": data.get("equation"),
        "winning_team_id": to_int(data.get("winning_team_id")), #can use to display the winner of the match in the app for past matches; for live and upcoming matches this will be null
        "toss_text": data.get("toss_text"), #to show along with match teams, start time etc in the app for live matches
    }

    teama = data.get("teama", {})
    teamb = data.get("teamb", {})

    match_master.update({
        "team1_id": to_int(teama.get("team_id")), #to map to teams correctly from other APIs later
        "team1_short_name": teama.get("short_name"), #short team name [e.g. RCB]
        "team1_logo_url": teama.get("logo_url"), #the url destination has an .png image which we can use in the app for better UX

        "team2_id": to_int(teamb.get("team_id")), #to map to teams correctly from other APIs later
        "team2_short_name": teamb.get("short_name"), #short team name [e.g. CSK]
        "team2_logo_url": teamb.get("logo_url"), #the url destination has an .png image which we can use in the app for better UX
    })

    pom = data.get("player_of_the_match", {}) #to show the player of the match in the app for past matches; for live and upcoming matches this will be null; run this api until the player of the match is announced in a live match to get the player of the match info
    match_master["player_of_match_id"] = to_int(pom.get("player_id")) #to show the player of the match in the app for past matches; for live and upcoming matches this will be null; run this api until the player of the match is announced in a live match to get the player of the match info
    match_master["player_of_match_name"] = pom.get("name") #to show the player of the match in the app for past matches; for live and upcoming matches this will be null; run this api until the player of the match is announced in a live match to get the player of the match info

    match_master_df = pd.DataFrame([match_master])


    # ---------------- MATCH TEAMS ----------------
    match_teams_df = pd.DataFrame([
        {
            "match_id": match_id, #to map to other APIs
            "team_id": to_int(teama.get("team_id")), #to map to teams correctly from other APIs
            "short_name": teama.get("short_name"), #short team name [e.g. RCB]
            "logo_url": teama.get("logo_url"), #the url destination has an .png image which we can use in the app for better UX
        },
        {
            "match_id": match_id,
            "team_id": to_int(teamb.get("team_id")), #to map to teams correctly from other APIs
            "short_name": teamb.get("short_name"), #short team name [e.g. CSK]
            "logo_url": teamb.get("logo_url"), #the url destination has an .png image which we can use in the app for better UX
        }
    ])


    # ---------------- MATCH SQUAD ----------------
    squad_rows = []
    squads = data.get("squads", {})

    # TEAM A
    for p in squads.get("teama", {}).get("squads", []):
        squad_rows.append({
            "match_id": match_id, #to map to other APIs
            "team_id": to_int(teama.get("team_id")), #to map to teams correctly from other APIs later
            "player_id": to_int(p.get("player_id")), #unique player id to map data from other APIs
            "name": p.get("name"), #full player name [e.g. Virat Kohli]
            "role": p.get("role"), #player role [e.g. Batsman, Bowler]
            "playing11": to_bool(p.get("playing11")), #to identify the starting 11 for each team in the app; for live matches this will be updated in real-time based on the playing 11 announced before the match and any changes during the match; for past matches this will be based on the final playing 11; for upcoming matches this will be null until the playing 11 is announced
            "substitute": to_bool(p.get("substitute")), #to identify if this player has been announced in the squad as a substitute; for live matches this will be updated in real-time based on the squad announcements before the match and any changes during the match; for past matches this will be based on the final squad; for upcoming matches this will be null until the squad is announced
            "is_out": to_bool(p.get("out")), #if the player started in playing xi and then was substituted out during the match, this will be true; only one true per team; for live matches this will be updated in real-time based on the match events; for past matches this will be based on the match events; for upcoming matches this will be null until the match is played
            "is_in": to_bool(p.get("in")), #if the player was substituted in during the match, this will be true; only one true per team; for live matches this will be updated in real-time based on the match events; for past matches this will be based on the match events; for upcoming matches this will be null until the match is played
        })

    # TEAM B
    for p in squads.get("teamb", {}).get("squads", []):
        squad_rows.append({
            "match_id": match_id, #to map to other APIs
            "team_id": to_int(teamb.get("team_id")), #to map to teams correctly from other APIs later
            "player_id": to_int(p.get("player_id")), #unique player id to map data from other APIs
            "name": p.get("name"), #full player name [e.g. Virat Kohli]
            "role": p.get("role"), #player role [e.g. Batsman, Bowler]
            "playing11": to_bool(p.get("playing11")), #to identify the starting 11 for each team in the app; for live matches this will be updated in real-time based on the playing 11 announced before the match and any changes during the match; for past matches this will be based on the final playing 11; for upcoming matches this will be null until the playing 11 is announced
            "substitute": to_bool(p.get("substitute")), #to identify if this player has been announced in the squad as a substitute; for live matches this will be updated in real-time based on the squad announcements before the match and any changes during the match; for past matches this will be based on the final squad; for upcoming matches this will be null until the squad is announced
            "is_out": to_bool(p.get("out")), #if the player started in playing xi and then was substituted out during the match, this will be true; only one true per team; for live matches this will be updated in real-time based on the match events; for past matches this will be based on the match events; for upcoming matches this will be null until the match is played
            "is_in": to_bool(p.get("in")), #if the player was substituted in during the match, this will be true; only one true per team; for live matches this will be updated in real-time based on the match events; for past matches this will be based on the match events; for upcoming matches this will be null until the match is played
        })

    match_squad_df = pd.DataFrame(squad_rows)


    # ---------------- SCORECARD ----------------
    innings_rows = []
    batting_rows = []
    bowling_rows = []
    fielding_rows = []

    scorecard = data.get("scorecard", {})
    innings = scorecard.get("innings", [])

    for inn in innings:
        inning_id = to_int(inn.get("iid"))

        innings_rows.append({
            "match_id": match_id, #to map to other APIs
            "inning_id": inning_id, #unique inning id to map batting, bowling, fielding data from other APIs
            "scores_full": inn.get("scores_full"), #full score string for the inning [e.g. "150/3 (20.0)"]
            "powerplay_runs": to_int(
                inn.get("powerplay", {}).get("p1", {}).get("totalpowerplayrun") #total powerplay runs for the inning; can show as a separate stat in the app for each inning; for live matches this will be updated in real-time based on the match events; for past matches this will be based on the match events; for upcoming matches this will be null until the match is played
            )
        })

        # BATTING
        for b in inn.get("batsmen", []):
            batting_rows.append({
                "match_id": match_id, #to map to other APIs
                "inning_id": inning_id, #unique inning id to map batting, bowling, fielding data from other APIs
                "player_id": to_int(b.get("batsman_id")), #unique player id to map data from other APIs
                "name": b.get("name"), #full player name [e.g. Virat Kohli]; we can use this for better UI in the app instead of long names for players like "Harshal Patel" -> "H. Patel"
                "runs": to_int(b.get("runs")), #runs scored by the batsman in this inning; for live matches this will be updated in real-time based on the match events; for past matches this will be based on the match events; for upcoming matches this will be null until the match is played
                "balls_faced": to_int(b.get("balls_faced")), #balls faced by the batsman in this inning; for live matches this will be updated in real-time based on the match events; for past matches this will be based on the match events; for upcoming matches this will be null until the match is played
                "fours": to_int(b.get("fours")), #fours hit by the batsman in this inning; for live matches this will be updated in real-time based on the match events; for past matches this will be based on the match events; for upcoming matches this will be null until the match is played
                "sixes": to_int(b.get("sixes")), #sixes hit by the batsman in this inning; for live matches this will be updated in real-time based on the match events; for past matches this will be based on the match events; for upcoming matches this will be null until the match is played
                "run0": to_int(b.get("run0")), #number of dot balls faced by the batsman in this inning; for live matches this will be updated in real-time based on the match events; for past matches this will be based on the match events; for upcoming matches this will be null until the match is played
                "run1": to_int(b.get("run1")), #number of singles hit by the batsman in this inning; for live matches this will be updated in real-time based on the match events; for past matches this will be based on the match events; for upcoming matches this will be null until the match is played
                "run2": to_int(b.get("run2")), #number of doubles hit by the batsman in this inning; for live matches this will be updated in real-time based on the match events; for past matches this will be based on the match events; for upcoming matches this will be null until the match is played
                "run3": to_int(b.get("run3")), #number of triples hit by the batsman in this inning; for live matches this will be updated in real-time based on the match events; for past matches this will be based on the match events; for upcoming matches this will be null until the match is played
                "run5": to_int(b.get("run5")), #number of 5 runs hit by the batsman in this inning; for live matches this will be updated in real-time based on the match events; for past matches this will be based on the match events; for upcoming matches this will be null until the match is played
                "how_out": b.get("how_out"), #dismissal type (e.g. "Caught", "Bowled", "LBW", "Run Out", "Stumped", "Hit Wicket", "Retired Hurt"); for live matches this will be updated in real-time based on the match events; for past matches this will be based on the match events; for upcoming matches this will be null until the match is played
                "dismissal": b.get("dismissal"), #full dismissal description (e.g. "Caught by AB de Villiers", "Bowled by Jasprit Bumrah", "Run Out (thrower: MS Dhoni, catcher: Ravindra Jadeja)"); for live matches this will be updated in real-time based on the match events; for past matches this will be based on the match events; for upcoming matches this will be null until the match is played
                "strike_rate": to_float(b.get("strike_rate")), #strike rate of the batsman in this inning; for live matches this will be updated in real-time based on the match events; for past matches this will be based on the match events; for upcoming matches this will be null until the match is played
                "bowler_id": to_int(b.get("bowler_id")), #unique player id of the bowler who dismissed the batsman; for live matches this will be updated in real-time based on the match events; for past matches this will be based on the match events; for upcoming matches this will be null until the match is played or the batsman is dismissed
                "first_fielder_id": to_int(b.get("first_fielder_id")), #unique player id of the first fielder involved in the dismissal (e.g. the catcher in a caught dismissal, the stumper in a stumped dismissal, the thrower or catcher in a run out); for live matches this will be updated in real-time based on the match events; for past matches this will be based on the match events; for upcoming matches this will be null until the match is played or the batsman is dismissed
                "second_fielder_id": to_int(b.get("second_fielder_id")), #unique player id of the second fielder involved in the dismissal (e.g. the catcher in a run out if the first fielder is the thrower); for live matches this will be updated in real-time based on the match events; for past matches this will be based on the match events; for upcoming matches this will be null until the match is played or the batsman is dismissed
                "third_fielder_id": to_int(b.get("third_fielder_id")), #unique player id of the third fielder involved in the dismissal (e.g. the catcher in a run out if the first fielder is the stumper and the second fielder is the thrower); for live matches this will be updated in real-time based on the match events; for past matches this will be based on the match events; for upcoming matches this will be null until the match is played or the batsman is dismissed
            })

        # BOWLING
        for bw in inn.get("bowlers", []):
            bowling_rows.append({
                "match_id": match_id, #to map to other APIs
                "inning_id": inning_id, #unique inning id to map batting, bowling, fielding data from other APIs
                "player_id": to_int(bw.get("bowler_id")), #unique player id to map data from other APIs
                "name": bw.get("name"), #full player name [e.g. Jasprit Bumrah]; we can use this for better UI in the app instead of long names for players like "Harshal Patel" -> "H. Patel"
                "overs": to_float(bw.get("overs")), #overs bowled by the bowler in this inning; for live matches this will be updated in real-time based on the match events; for past matches this will be based on the match events; for upcoming matches this will be null until the match is played
                "maidens": to_int(bw.get("maidens")), #maidens bowled by the bowler in this inning; for live matches this will be updated in real-time based on the match events; for past matches this will be based on the match events; for upcoming matches this will be null until the match is played
                "runs_conceded": to_int(bw.get("runs_conceded")), #runs conceded by the bowler in this inning; for live matches this will be updated in real-time based on the match events; for past matches this will be based on the match events; for upcoming matches this will be null until the match is played
                "wickets": to_int(bw.get("wickets")), #wickets taken by the bowler in this inning; for live matches this will be updated in real-time based on the match events; for past matches this will be based on the match events; for upcoming matches this will be null until the match is played
                "noballs": to_int(bw.get("noballs")), #noballs bowled by the bowler in this inning; for live matches this will be updated in real-time based on the match events; for past matches this will be based on the match events; for upcoming matches this will be null until the match is played
                "wides": to_int(bw.get("wides")), #wides bowled by the bowler in this inning; for live matches this will be updated in real-time based on the match events; for past matches this will be based on the match events; for upcoming matches this will be null until the match is played
                "econ": to_float(bw.get("econ")), #economy rate of the bowler in this inning; for live matches this will be updated in real-time based on the match events; for past matches this will be based on the match events; for upcoming matches this will be null until the match is played
                "run0": to_int(bw.get("run0")), #number of dot balls bowled by the bowler in this inning; for live matches this will be updated in real-time based on the match events; for past matches this will be based on the match events; for upcoming matches this will be null until the match is played
                "bowled_count": to_int(bw.get("bowledcount")), #number of times the bowler has dismissed a batsman by bowling them in this inning; for live matches this will be updated in real-time based on the match events; for past matches this will be based on the match events; for upcoming matches this will be null until the match is played
                "lbw_count": to_int(bw.get("lbwcount")), #number of times the bowler has dismissed a batsman by LBW in this inning; for live matches this will be updated in real-time based on the match events; for past matches this will be based on the match events; for upcoming matches this will be null until the match is played
            })

        # FIELDING
        for f in inn.get("fielder", []):
            fielding_rows.append({
                "match_id": match_id, #to map to other APIs
                "inning_id": inning_id, #unique inning id to map batting, bowling, fielding data from other APIs
                "player_id": to_int(f.get("fielder_id")), #unique player id to map data from other APIs
                "fielder_name": f.get("fielder_name"), #full player name [e.g. AB de Villiers]; we can use this for better UI in the app instead of long names for players like "Harshal Patel" -> "H. Patel"
                "catches": to_int(f.get("catches")), #catches taken by the fielder in this inning; for live matches this will be updated in real-time based on the match events; for past matches this will be based on the match events; for upcoming matches this will be null until the match is played
                "runout_thrower": to_int(f.get("runout_thrower")), #number of run outs where the fielder was the thrower in this inning; for live matches this will be updated in real-time based on the match events; for past matches this will be based on the match events; for upcoming matches this will be null until the match is played
                "runout_catcher": to_int(f.get("runout_catcher")), #number of run outs where the fielder was the catcher in this inning; for live matches this will be updated in real-time based on the match events; for past matches this will be based on the match events; for upcoming matches this will be null until the match is played
                "runout_direct_hit": to_int(f.get("runout_direct_hit")), #number of direct hit run outs involving the fielder in this inning; for live matches this will be updated in real-time based on the match events; for past matches this will be based on the match events; for upcoming matches this will be null until the match is played
                "stumping": to_int(f.get("stumping")), #number of stumpings involving the fielder in this inning; for live matches this will be updated in real-time based on the match events; for past matches this will be based on the match events; for upcoming matches this will be null until the match is played
                "is_substitute": to_bool(f.get("is_substitute")), #whether the fielder is a substitute fielder
            })

    return {
        "match_master": match_master_df,
        "match_teams": match_teams_df,
        "match_squad": match_squad_df,
        "match_innings": pd.DataFrame(innings_rows),
        "match_batting_scorecard": pd.DataFrame(batting_rows),
        "match_bowling_scorecard": pd.DataFrame(bowling_rows),
        "match_fielding_scorecard": pd.DataFrame(fielding_rows),
    }


# ---------- EXPORT ----------
def export_to_excel(tables, filename):
    with pd.ExcelWriter(filename, engine="xlsxwriter") as writer:
        for name, df in tables.items():
            df.to_excel(writer, sheet_name=name[:31], index=False)

    print(f"Saved: {filename}")


# ---------- RUN ----------
if __name__ == "__main__":
    data = fetch_match_data(MATCH_ID)
    tables = parse_match_data(data)
    export_to_excel(tables, f"match_{MATCH_ID}.xlsx")