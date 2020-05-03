import React , {useEffect} from "react"
import {makeStyles, Typography, Button, Container, CircularProgress, TextField, Grid} from "@material-ui/core";
import {Autocomplete} from '@material-ui/lab';
import SupporterTypes from './SupporterTypes.js'

const useStyles = makeStyles(theme => ({
    paper: {
      marginTop: theme.spacing(8),
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    },
    form: {
      width: "100%",
      marginTop: theme.spacing(2),
      align: "center",
      padding: 4
    },
    button: {
      width: "100%",
      marginTop: theme.spacing(2),
      align: "center",
    }
}));

function handleSubmit(){
    //TODO
}

function extractSpecializationTypes(spec){
    var arr=[]
    for(let i=0;i<spec.length;i++){
        arr.push(spec[i]["specialization_type"])
    }
    return arr
}

function extractTags(tags){
    var arr=[]
    for(let i=0;i<tags.length;i++){
        arr.push(tags[i].tag_type)
    }
    console.log(arr)
    return arr
}

function extractSupporterTypes(settings){
    var arr = []
    if(settings.professional_staff)
        arr.push("Professional Staff")
    if(settings.student_staff)
        arr.push("Student Staff")
    if(settings.alumni)
        arr.push("Alumni")
    if(settings.faculty)
        arr.push("Faculty")
    if(settings.grad_student)
        arr.push("Graduate Student")
    if(settings.other)
        arr.push("Other")
    return arr
}

const ProfileInformation = (props) => {
    const classes=useStyles();
    const {settings} = props
    const spec_types = extractSpecializationTypes(settings.specialization_types)
    const supporter_types=extractSupporterTypes(settings)
    var tags_list = []
    const [supporterTypes, setSupporterTypes]=React.useState(supporter_types);
    const [teams, setTeams]=React.useState(settings.team_name);
    const [specializations, setSpecializations]=React.useState(spec_types);
    const [employer, setEmployer]=React.useState(settings.employer);
    const [title, setTitle]=React.useState(settings.title);
    const [tags, setTags]=React.useState(settings.tags)
    const [tagsList, setTagsList]=React.useState([])
    const [typesList, setTypesList]=React.useState([])
    const [loaded, setLoaded]=React.useState(false)

    useEffect(() => {
        //fetchSupporterList(initial_fetch_url);
        setLoaded(false);
        Promise.all([fetch("https://7jdf878rej.execute-api.us-east-2.amazonaws.com/prod/table/tags"), 
        fetch("https://7jdf878rej.execute-api.us-east-2.amazonaws.com/prod/table/specialization-types")])
  
        .then(([res1, res2]) => { 
           return Promise.all([res1.json(), res2.json()]) 
        })
        .then(([res1, res2]) => {
          setTagsList(extractTags(res1.tags));
          setTypesList(extractSpecializationTypes(res2.specialization_types));
          console.log(res2)
          setLoaded(true);
        });
      }, [])

    //console.log(tagsList)
    //console.log(typesList)

    if(!loaded){
        return (
          <div align="center">
            <br></br>
            <Typography variant="h4">Loading...</Typography>
            <br></br>
            <CircularProgress />
          </div>
        )
    }
    
    return (
        <Container component="main">
        <div className={classes.paper}>
            <Typography component="h1" variant="h5">
                Supporter Information
            </Typography>
            <form className={classes.form}>
                <Grid container>
                    <Grid item xs={6}>
                        <TextField
                            variant="outlined"
                            margin="normal"
                            fullWidth
                            label="Current Employer"
                            autoFocus
                            defaultValue={employer}
                            form className={classes.form}
                            onChange={e => setEmployer(e.target.value)}
                        />   
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            variant="outlined"
                            margin="normal"
                            fullWidth
                            label="Title"
                            autoFocus
                            defaultValue={title}
                            form className={classes.form}
                            onChange={e => setTitle(e.target.value)}
                        />   
                    </Grid>
                </Grid>
                <Autocomplete
                    multiple
                    className={classes.form}
                    options={SupporterTypes}
                    defaultValue={supporterTypes}
                    renderInput={(params) => (
                    <TextField
                        {...params}
                        variant="outlined"
                        label="Supporter Types"
                    />
                    )}
                    onChange={(e,v) => setSupporterTypes(v)}
                />
                <TextField
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    label="Team"
                    autoFocus
                    defaultValue={teams}
                    form className={classes.form}
                    onChange={e => setTeams(e.target.value)}
                />   
                <Autocomplete
                    multiple
                    className={classes.form}
                    options={typesList}
                    defaultValue={specializations}
                    renderInput={(params) => (
                    <TextField
                        {...params}
                        variant="outlined"
                        label="Supporter Specialization Areas"
                    />
                    )}
                    onChange={(e,v) => setSpecializations(v)}
                />

                <Autocomplete
                    multiple
                    className={classes.form}
                    options={tagsList}
                    defaultValue={tags}
                    renderInput={(params) => (
                    <TextField
                        {...params}
                        variant="outlined"
                        label="Supporter Tags"
                    />
                    )}
                    onChange={(e,v) => setTags(v)}
                />
                <Button
                    margin="normal"
                    form className={classes.button}
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                >
                    Save
                </Button>
            </form>
        </div>
        </Container>
    );
}

export default ProfileInformation;