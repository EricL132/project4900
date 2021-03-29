import { timingSafeEqual } from 'crypto'
import React from 'react'
import './article.css'

class article extends React.Component {
    constructor(props) {
        super(props)
        this.getArticle = this.getArticle.bind(this)
        this.handleError = this.handleError.bind(this)
        this.addNewComment = this.addNewComment.bind(this)
        this.checkForLogin = this.checkForLogin.bind(this)
        this.state = {
            article: "",
            showBackUpVid: false,
            pageLoaded: false
        }
        this.getArticle()
    }
    componentDidMount() {
        this.checkForLogin()
    }
    async checkForLogin() {
        const res = await fetch('/user/account/access', { method: "GET", headers: { 'access-token': this.state.accessToken } })
        if (res.status === 200) {
            this.setState({ accessToken: res.headers.get('access-token') })
            const tokenInfo = await this.jwtDecode()
            this.setState({ email: tokenInfo.email })
            this.setState({ loggedInName: tokenInfo.name })
            this.setState({ admin: tokenInfo.admin })
            this.setState({ loggedIn: true })
        }
    }

    async jwtDecode() {

        return JSON.parse(window.atob(this.state.accessToken.split('.')[1]));
    }


    async getArticle() {
        const res = await fetch(`/info/findarticle/${window.location.search}`)

        if (res.status === 200) {
            const resInfo = await res.json()
            this.setState({ article: resInfo.article }, () => {
                this.handleError()
            })
            
        }
    }
    async handleError() {
        console.log(this.state.article)
        const res = await fetch(`https://www.youtube.com/oembed?url=${this.state.article.vid}&format=json`)
        if (res.status !== 200) {
            this.setState({ showBackUpVid: true })
        }
        this.setState({ pageLoaded: true })
    }
    async addNewComment() {
        const comment = document.getElementById('commenttext').value
        await fetch('/info/addComment', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ comment: comment, article: this.state.article }) })
        document.getElementById('commenttext').value = ""
    }
    render() {
        return (
            <div className="article-page-container">
                {this.state.article ?

                    <div className="middle-container">
                        <div className="video-container">
                            {!this.state.showBackUpVid && this.state.pageLoaded ?
                                <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${this.state.article.vid.split('=')[1]}`} frameBorder="0" allowFullScreen />
                                :
                                <iframe width="100%" height="100%" src={this.state.article.backupvid} frameBorder="0" allowFullScreen />
                            }

                        </div>
                        <div className="article-info">
                            <h1 className="article-title">{this.state.article.title}</h1>
                            <h3 className="author-name">{this.state.article.author}, {this.state.article.publishedAt}</h3>
                            <span className="article-description">{this.state.article.description}</span>
                        </div>
                        <div id="comments-container">
                            <h1 id="comment-header">Comments</h1>
                            {this.state.article.comments ?
                                this.state.article.comments.map((comment) => {
                                    return <div className="comment-container">
                                        <h3>{comment.name}</h3>
                                        <span>{comment.comment}</span>
                                    </div>
                                })

                                : null}
                            <div className="comment-container">
                                <h3>Eric</h3>
                                <span>vjsdovjdsofidsiofoidsfoids</span>
                            </div>

                            {this.state.loggedIn ?
                                <div id="commentinfobarcontainer">
                                    <div id="commentinfobar">
                                        <textarea spellCheck="false" autoComplete="off" id="commenttext" placeholder="Message" onKeyDown={(e) => { if (e.code === "Enter") { this.addNewComment() } }}></textarea>
                                        <button id="commentbutton" className="default-blue-button" onClick={this.addNewComment}>Submit</button>
                                    </div>
                                </div>
                                :
                                <div id="commentinfobar" style={{ opacity: ".4" }}>
                                    <span id="logincommentspan">Login To Comment</span>
                                    <textarea spellCheck="false" autoComplete="off" id="commenttext" placeholder="Message" disabled></textarea>


                                </div>
                            }

                        </div>

                    </div>

                    : null}

            </div>
        )
    }
}
export default article;