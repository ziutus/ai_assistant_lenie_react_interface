import logo from './logo.svg';
import './App.css';
import axios from 'axios';
import React, { useState } from 'react';

import ListItemSearchSimilar from './utils';

let websiteObjectEmpty = {
    id: null,
    next_id: null,
    previous_id: null,
    url: '',
    tags: '',
    title: '',
    summary: '',
    text: '',
    text_english: '',
    language: '',
    source: '',
    document_type: 'webpage',
    document_state: '',
    document_state_error: '',
    chapter_list: '',
    author: ''
}

let showElements = {
    list : false,
    add : true,
    search : false
}



function App() {

    const [apiUrl, setApiUrl] = useState("http://localhost:5000/");
    const [apiKey, setApiKey] = useState('');
    const [linkId, setLinkId] = useState('');
    const [dbStatus, setDbStatus] = useState('unknown');

    const [website, setWebsite] = useState(websiteObjectEmpty);
    const [message, setMessage] = useState('');

    const [data, setData] = useState([]);

    const [searchSimilar, setSearchSimilar] = useState('');
    const [searchSimilarResult, setSearchSimilarResult] = useState([]);

    React.useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const apikeyParam = params.get('apikey');

        if (apikeyParam) {
            setApiKey(apikeyParam);
        }

        handleGetDBStatus();
    }, []);

    const handleShowElements = (element) => {
        console.log(element)
        showElements.list = false
        showElements.add = false
        showElements.search = false
        if (element === 'list') {
            showElements.list = true
        }
        if (element === 'add') {
            showElements.add = true
        }
        if (element === 'search') {
            showElements.search = true
        }
    }

    const handleSearchSimilar = async () => {
        // console.log(website.text)
        try {
            const response = await axios.post(`${apiUrl}/website_similar`, {
                search: searchSimilar,
            }, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'x-api-key': `${apiKey}`,
                },
            });
            console.log(response.data.websites)
            setSearchSimilarResult([])
            setSearchSimilarResult(response.data.websites)

        } catch (error) {
            console.error("There was an error on handleSearchSimilar!", error);
            let message = error.message;
            if (error.response && error.response.status && error.response.status === 400) {
                message += " Check your API key first"
            }
            setMessage(`There was an error on handleSearchSimilar: ${message}`);
        }
    }

    const handleSaveWebsiteToCorrect = async () => {

        var text_tmp = website.text
        var text_tmp_english = website.text_english
        if (website.document_type === 'link') {
            text_tmp = ''
            text_tmp_english = ''
        }

        try {
            const response = await axios.post(`${apiUrl}/save_website`, {
                id: website.id,
                url: website.url   ,
                tags: website.tags,
                title: website.title,
                summary: website.summary,
                source: website.source,
                text: text_tmp,
                text_english: text_tmp_english,
                language: website.language,
                document_type: website.document_type,
                document_state: website.document_state,
                chapter_list: website.chapter_list,
                author: website.author
            }, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'x-api-key': `${apiKey}`,
                },
            });
            handleClean()
            setMessage(response.data.message);
            console.log(response.data.message);
            console.log(response.data)

        } catch (error) {
            console.error("There was an error saving the data!", error);
            let message = error.message;
            if (error.response && error.response.status && error.response.status === 400) {
                message += " Check your API key first"
            }
            setMessage(`There was an error saving the data: ${message}`);
        }
    };

    const handleSaveWebsiteNext = async () => {

        var text_tmp = website.text
        var text_tmp_english = website.text_english
        if (website.document_type === 'link') {
            text_tmp = ''
            text_tmp_english = ''
        }
        let next_id = website.next_id

        try {
            const response= await axios.post(`${apiUrl}/save_website`, {
                id: website.id,
                url: website.url   ,
                tags: website.tags,
                title: website.title,
                summary: website.summary,
                source: website.source,
                text: text_tmp,
                text_english: text_tmp_english,
                language: website.language,
                document_type: website.document_type,
                document_state: 'READY_FOR_TRANSLATION',
                chapter_list: website.chapter_list,
                author: website.author
            }, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'x-api-key': `${apiKey}`,
                },
            });

            console.log("Getting next document ID to correct")
            const response2 = await axios.get('' +
                `${apiUrl}/website_get_next_to_correct`, {
                params: {
                    id: website.id
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'x-api-key': `${apiKey}`,
                }
            });

            handleClean()
            setMessage(response2.data.message);
            console.log(response2.data.message);
            console.log(response2.data)
            handleGetLinkByID(response2.data["next_id"])

        } catch (error) {
            console.error("There was an error saving the data!", error);
            let message = error.message;
            if (error.response && error.response.status && error.response.status === 400) {
                message += " Check your API key first"
            }
            setMessage(`There was an error saving the data: ${message}`);
        }
    };

    const handleTranslate = async () => {
        try {
            const response = await axios.post(`${apiUrl}/translate`, {
                text: website.text,
                target_language: 'en',
                source_language: 'pl'
            }, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'x-api-key': `${apiKey}`,
                },
            });
            setWebsite(prevState => ({ ...prevState, text_english: response.data.message}));
            console.log("end of handleTranslate")

        } catch (error) {
            console.error("There was an error on handleTranslate!", error);
            let message = error.message;
            if (error.response && error.response.status && error.response.status === 400) {
                message += " Check your API key first"
            }
            setMessage(`There was an error on handleTranslate: ${message}`);
        }
    }

    const handleCorrectUsingAI = async () => {
        try {
            const response = await axios.post(`${apiUrl}/website_correct_using_ai`, {
                text: website.text,
            }, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'x-api-key': `${apiKey}`,
                },
            });
            setWebsite(prevState => ({ ...prevState, text: response.data.text}));
            console.log("end of handleCorrectUsingAI")

        } catch (error) {
            console.error("There was an error on handleCorrectUsingAI!", error);
            let message = error.message;
            if (error.response && error.response.status && error.response.status === 400) {
                message += " Check your API key first"
            }
            setMessage(`There was an error on handleCorrectUsingAI: ${message}`);
        }
    }

    const handleGetEntryToReview = async () => {
        console.log("Getting first document ID to correct")

        let website_id;
        if (website.id > 0) {
            website_id = website.id
        } else {
            website_id = 1
        }

        try {
            const response2 = await axios.get('' +
                `${apiUrl}/website_get_next_to_correct`, {
                params: {
                    id: website_id
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'x-api-key': `${apiKey}`,
                }
            })

            handleClean()
            setMessage(response2.data.message);
            console.log(response2.data.message);
            console.log(response2.data)
            handleGetLinkByID(response2.data["next_id"])

        } catch (error) {
            console.error("There was an error on handleGetEntryToReview!");
            console.error(error)
            let message = error.message;
            if (error.response && error.response.status && error.response.status === 400) {
                message += " Check your API key first"
            }
            setMessage(`There was an error on handleGetEntryToReview: ${message}`);
        }

    }

    const handleSplitTextForEmbedding = async () => {
        try {
            const response = await axios.post(`${apiUrl}/website_split_for_embedding`, {
                chapter_list: website.chapter_list,
                text: `${website.text}`,
            }, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'x-api-key': `${apiKey}`,
                },
            });
            setWebsite(prevState => ({ ...prevState, text: response.data.text}));
            console.log("end of handleSplitTextForEmbedding")

        } catch (error) {
            console.error("There was an error on handleSplitTextForEmbedding!", error);
            let message = error.message;
            if (error.response && error.response.status && error.response.status === 400) {
                message += " Check your API key first"
            }
            setMessage(`There was an error on handleSplitTextForEmbedding: ${message}`);
        }
    }

    const handleSummary = (summary) => {
        setWebsite(prevState => ({ ...prevState, summary: summary }));
    }

    const handleTitle = (title) => {
        setWebsite(prevState => ({ ...prevState, title: title }));
    }
    const handleTags = (tags) => {
        setWebsite(prevState => ({ ...prevState, tags: tags }));
    }
    const handleWebsiteLanguage = (language) => {
        setWebsite(prevState => ({ ...prevState, language: language }));
    }
    const handleWebsiteContent = (text) => {
        setWebsite(prevState => ({ ...prevState, text: text }));
    }
    const handleWebsiteContentTranslated = (text) => {
        setWebsite(prevState => ({ ...prevState, text_english: text }));
    }
    const handleClean = () => {
        setWebsite(websiteObjectEmpty)
        setLinkId('')
    }
    const handleWebsiteSource = (source) => {
        setWebsite(prevState => ({ ...prevState, source: source }));
    }

    const handleGetPageByUrl = async (url) => {
        setWebsite(prevState => ({ ...prevState, url: url }));
        if (url.length > 0) {
            try {
                const response = await axios.post(`${apiUrl}/website_is_paid`, {
                    url: url,
                }, {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'x-api-key': `${apiKey}`,
                    },
                });

                if (response.data.is_paid === false) {
                    try {
                        const response = await axios.post(`${apiUrl}/website_download_text_content`, {
                            url: url,
                        }, {
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded',
                                'x-api-key': `${apiKey}`,
                            },
                        });
                        // console.log(response.data.message)
                        // console.log(response.data)

                        setWebsite(prevState => ({ ...prevState, text: response.data.text,
                            summary: response.data.summary, title: response.data.title, language: response.data.language }));


                        setMessage(response.data.message);
                        console.log("end of checking if link handleGetLinkAll");

                    } catch (error) {
                        console.error("There was an error on handleGetLinkAll!", error);
                        let message = error.message;
                        if (error.response.status === 400) {
                            message += " Check your API key first"
                        }
                        setMessage(`There was an error on handleGetLinkAll. ${message}`);
                    }

                } else {
                    setMessage("Paid website, not downloaded")
                }

            } catch (error) {
                console.error("There was an error on handleGetLinkAll!", error);
                let message = error.message;
                if (error.response.status === 400) {
                    message += " Check your API key first"
                }

                setMessage(`There was an error on handleGetLinkAll. ${message}`);
            }
        }
    }

    const handleGetLinkByID = async (link_id) => {
        setLinkId(link_id)
        try {
            const response = await axios.get('' +
                `${apiUrl}/website_get`, {
                params: {
                    id: link_id
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'x-api-key': `${apiKey}`,
                }
            });

            setMessage("")
            console.log(response.data)
            console.log('cleaning values in webiste object')
            handleClean()
            setLinkId(link_id)
            console.log(website)

            setWebsite(response.data)

        } catch (error) {
            console.error(error);
            let message = error.message;
            if (error.response && error.response.status && error.response.status === 400) {
                message += " Check your API key first"
            }
            setMessage(`Error on handleGetLinkByID ${message}`)
        }
    }

    const handleGetDBStatus = async () => {
        setDbStatus("unknown")
        try {
            const response = await axios.get(
                `https://s2muljcg31.execute-api.us-east-1.amazonaws.com/v1/infra/status`, {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': `${apiKey}`,
                }
            });

            setMessage("")
            console.log(response.data)
            setDbStatus(response.data)

        } catch (error) {
            console.log("Error found during checking DB status")
            console.error(error);
            let message = error.message;
            if (error.response && error.response.status && error.response.status === 400) {
                message += " Check your API key first"
            }
            setMessage(`Error on handleGetLinkByID ${message}`)
        }
    }

    const handleStartDB = async () => {
        try {
            const response = await axios.post(
                `https://s2muljcg31.execute-api.us-east-1.amazonaws.com/v1/infra/start`, {},
                { headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': `${apiKey}`,
                }}
            );

            setMessage("")
            console.log(response.data)
            await handleGetDBStatus()

        } catch (error) {
            console.log("Error found during starting DB")
            console.error(error);
            let message = error.message;
            if (error.response && error.response.status && error.response.status === 400) {
                message += " Check your API key first"
            }
            setMessage(`Error on handleGetLinkByID ${message}`)
        }
    }

    const handleStopDB = async () => {
        try {
            const response = await axios.post(
                `https://s2muljcg31.execute-api.us-east-1.amazonaws.com/v1/infra/stop`, {},
                { headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': `${apiKey}`,
                    }}
            );

            setMessage("")
            console.log(response.data)
            await handleGetDBStatus()

        } catch (error) {
            console.log("Error found during stopping DB")
            console.error(error);
            let message = error.message;
            if (error.response && error.response.status && error.response.status === 400) {
                message += " Check your API key first"
            }
            setMessage(`Error on handleGetLinkByID ${message}`)
        }
    }


    const handleGetList = async () => {
        try {
            const response = await axios.get(`${apiUrl}/website_list`, {
                headers: {
                    'x-api-key': `${apiKey}`,
                },
            });

            console.log(response.data.message)
            console.log(response.data)

            if (response.data.websites != null) {
                setData(response.data.websites)
            }
            console.log("end of handleGetList")

        } catch (error) {
            console.error("There was an error on handleGetList!", error);
            let message = error.message;
            if (error.response && error.response.status && error.response.status === 400) {
                message += " Check your API key first"
            }
            setMessage(`There was an error on suggesting handleGetList. ${message}`);
        }
    };



    return (
        <div className="App">
            <div>
                <a href="#" onClick={() => handleShowElements('add')}>Dodaj</a> |
                <a href="#" onClick={() => handleShowElements('list')}>Lista</a> |
                <a href="#" onClick={() => handleShowElements('search')}>Szukaj</a>
            </div>
            <h1>Lenie v0.2.2</h1>

            <div>
                <label>
                    Serwer API:
                    <input type="text" value={apiUrl} onChange={e => setApiUrl(e.target.value)}
                           style={{width: '20ch'}}/> Status Bazy danych: {dbStatus}
                </label>
                {dbStatus == "stopped" &&
                    <button onClick={() => handleStartDB()}>Start</button>
                }
                {dbStatus == "available" &&
                    <button onClick={() => handleStopDB()}>Stop</button>
                }
            </div>
            <div>
                <label>
                    API Key:
                    <input type="text" value={apiKey} onChange={e => setApiKey(e.target.value)}
                           style={{width: '40ch'}}/>
                </label>
            </div>
            <div>
                <label>
                    Author:
                    <input type="text" value={website.author}
                           onChange={e => setWebsite(prevState => ({...prevState, author: e.target.value}))}
                           style={{width: '40ch'}}/>
                </label>
            </div>
            <div>
                <label>
                    Link ID:
                    <input type="text" value={linkId} onChange={e => setLinkId(e.target.value)}
                           style={{width: '20ch'}}/>
                </label>
                <button onClick={() => handleGetLinkByID(linkId)}>read</button>
                {website.previous_id &&
                    <button onClick={() => handleGetLinkByID(website.previous_id)}> ({website.previous_id})
                        previous</button>}
                {website.next_id &&
                    <button onClick={() => handleGetLinkByID(website.next_id)}> ({website.next_id}) next</button>}
                <button onClick={handleClean}>clean</button>
                <button onClick={handleGetEntryToReview}>Next To review</button>
            </div>
            <div>
                <label>
                    source:
                    <input type="text" value={website.source} onChange={e => handleWebsiteSource(e.target.value)}
                           style={{width: '40ch'}}/>
                </label>
            </div>
            <div>
                <label>
                    Język strony:
                    <input type="text" value={website.language} onChange={e => handleWebsiteLanguage(e.target.value)}
                           style={{width: '20ch'}}/>
                </label>
            </div>

            <div>
                <label>Document type</label>
                <select value={website.document_type}
                        onChange={e => setWebsite(prevState => ({...prevState, document_type: e.target.value}))}>
                    <option value="webpage">Webpage</option>
                    <option value="link">Link</option>
                    {/*<option value="note" >Note</option>*/}
                    <option value="movie">Movie</option>
                    <option value="youtube">Youtube</option>
                </select>
            </div>
            <div>
                <label>Document state error: {website.document_state_error}</label>
            </div>
            <div>
                <label>Document state</label>
                <select value={website.document_state}
                        onChange={e => setWebsite(prevState => ({...prevState, document_state: e.target.value}))}>
                    <option value="NONE">DEFAULT NONE state</option>
                    <option value="ERROR_DOWNLOAD">ERROR_DOWNLOAD</option>
                    <option value="URL_ADDED">URL_ADDED</option>
                    <option value="NEED_TRANSCRIPTION">NEED_TRANSCRIPTION</option>
                    <option value="TRANSCRIPTION_DONE">TRANSCRIPTION_DONE</option>
                    <option value="TRANSCRIPTION_IN_PROGRESS">TRANSCRIPTION_IN_PROGRESS</option>
                    <option value="NEED_MANUAL_REVIEW">NEED_MANUAL_REVIEW</option>
                    <option value="READY_FOR_TRANSLATION">READY_FOR_TRANSLATION</option>
                    <option value="READY_FOR_EMBEDDING">READY_FOR_EMBEDDING</option>
                    <option value="EMBEDDING_EXIST">EMBEDDING_EXIST</option>
                </select>
            </div>

            <div>
                <label>
                    Link:
                    <input type="text" value={website.url} onChange={e => handleGetPageByUrl(e.target.value)}
                           style={{width: '150ch'}}/>
                </label>
                <a href={website.url} target="_blank" rel="noopener noreferrer">Open</a>
                <button onClick={() => handleGetPageByUrl(website.url)}>read</button>
            </div>

            <div>
                <label>
                    title:
                    <input type="text" value={website.title} onChange={e => handleTitle(e.target.value)}
                           style={{width: '150ch'}}/>
                </label>
            </div>

            <div>
                <label>
                    summary:
                    <input type="text" value={website.summary} onChange={e => handleSummary(e.target.value)}
                           style={{width: '150ch'}}/>
                </label>
            </div>

            <div>
                <label>
                    Tags:
                    <input type="text" value={website.tags} onChange={e => handleTags(e.target.value)}
                           style={{width: '150ch'}}/>
                </label>
            </div>

            {(website.document_type === 'webpage' || website.document_type === 'movie' || website.document_type === 'youtube') && (
                <>
                    <div>
                        <label>
                            Website content:
                            <textarea
                                cols="100"
                                rows="20"
                                value={website.text}
                                onChange={e => handleWebsiteContent(e.target.value)}
                                style={{width: 'auto'}}>
                    </textarea>
                            <textarea
                                cols="100"
                                rows="20"
                                value={website.text_english}
                                onChange={e => handleWebsiteContentTranslated(e.target.value)}
                                style={{width: 'auto'}}>
                    </textarea>
                        </label>
                        <div>
                            <button onClick={handleSplitTextForEmbedding}>Split text for Embedding</button>
                            <button onClick={handleCorrectUsingAI}>Correct using AI</button>
                            <button onClick={handleTranslate}>Translate</button>
                            <a href="https://platform.openai.com/tokenizer" target="_blank" rel="noopener noreferrer">OpenAI
                                Tokenizer</a>
                        </div>
                        {website.text && <div>Length: {website.text.length}</div>}


                    </div>
                    <div>
                        chapter list:
                        <textarea
                            cols="70"
                            rows="10"
                            value={website.chapter_list}
                            onChange={e => handleWebsiteContentTranslated(e.target.value)}
                            style={{width: 'auto'}}>
                    </textarea>
                    </div>
                </>
            )}
            <button onClick={handleSaveWebsiteToCorrect}>Zapisz do poprawy</button>
            <button onClick={handleSaveWebsiteNext}>Zapisz i nastepny do poprawy</button>

            {message && <p>{message}</p>}

            <div>
                <label>Lista Zapisanych Stron i linków ({data.length})</label>
                <button onClick={handleGetList}>Get List</button>

                <ul>
                    {data.map(item => (
                        <li key={item.id}>
                            {item.id} -
                            <a href={item.url} target="_blank" rel="noopener noreferrer">{item.url}</a>
                            ({item.document_type})
                            <button onClick={() => handleGetLinkByID(item.id)}>Edit</button>
                            {/*<button onClick={() => handleDeleteLink(item.id)}>Delete</button>*/}
                        </li>
                    ))}
                </ul>
            </div>

            <div>
                <label>
                    Search similar:
                    <input type="text" value={searchSimilar} onChange={e => setSearchSimilar(e.target.value)}
                           style={{width: '150ch'}}/>
                </label>
                <button onClick={() => handleSearchSimilar()}>Search</button>
            </div>

            <ul>
                {searchSimilarResult.map((item) => (
                    <ListItemSearchSimilar
                        key={item.id}
                        item={item}
                    />
                ))}
            </ul>
        </div>

    );
}

export default App;
