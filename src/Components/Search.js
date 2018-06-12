import debounce from 'lodash.debounce'
import React, { Component } from 'react'
import { Query, withApollo } from 'react-apollo'
import remcalc from 'remcalc'
import styled from 'styled-components'
import FontAwesomeIcon from '@fortawesome/react-fontawesome'

const Wrapper = styled.div`
    display: flex;
    width: ${remcalc(130)};
    position: relative;
    transition: all 0.35s ease-in-out;

    @media (min-width: ${remcalc(769)}) {
        &.expanded {
            width: 30%;
        }
    }
`

const Icon = styled(FontAwesomeIcon)`
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
`

const SearchIcon = Icon.extend`
    left: ${remcalc(5)};
    max-width: ${remcalc(20)};
`

const CloseIcon = Icon.extend`
    right: ${remcalc(20)};
`

const Input = styled.input`
    border: none;
    font-family: Avenir;
    padding: ${remcalc(10)} ${remcalc(10)} ${remcalc(10)} ${remcalc(35)};
    width: 100%;
    font-size: ${remcalc(24)};
    font-weight: 100;
    outline: none;
    background: ${props => props.theme.primary};
    color: ${props => props.theme.main};
    @media (max-width: ${remcalc(768)}) {
        font-size: ${remcalc(20)};
    }
`

class Search extends Component {
    state = {
        focused: false
    }

    componentDidMount() {
        document.addEventListener('keydown', this.handleKeyDown)
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleKeyDown)
    }

    onFocus = () => {
        this.setState({ focused: true })
    }

    onBlur = () => {
        this.setState({ focused: false })
    }

    handleKeyDown = event => {
        if (
            document.body.classList.contains('cinema-mode') ||
            document.body.classList.contains('ReactModal__Body--open')
        ) {
            return false
        }

        if (event.keyCode === 191 && this.state.focused === false) {
            setTimeout(() => {
                this.input.focus()
                this.input.value = ''
            })
        } else if (event.keyCode === 27) {
            this.input.value = ''
            this.props.client.writeData({
                data: { [this.props.keyName]: '' }
            })
            this.input.blur()
        }
    }

    onChange = debounce(() => {
        this.props.client.writeData({
            data: { [this.props.keyName]: this.input.value }
        })
    }, 200)

    render() {
        const { keyName, query } = this.props
        return (
            <Query query={query}>
                {({ data, client }) => (
                    <Wrapper
                        role="search"
                        className={`${
                            this.state.focused ||
                            (data[keyName] && data[keyName].length)
                                ? 'expanded'
                                : ''
                        }`}
                    >
                        <SearchIcon icon="search" size="lg" />
                        {data[keyName] &&
                            data[keyName].length && (
                                <CloseIcon
                                    icon="times"
                                    size="lg"
                                    onClick={() => {
                                        this.input.value = ''
                                        client.writeData({
                                            data: { [keyName]: '' }
                                        })
                                    }}
                                />
                            )}
                        <Input
                            aria-label="Search"
                            innerRef={node => (this.input = node)}
                            onBlur={this.onBlur}
                            onChange={this.onChange}
                            onFocus={this.onFocus}
                            onKeyDown={this.handleKeyDown}
                            placeholder="Search"
                            type="text"
                        />
                    </Wrapper>
                )}
            </Query>
        )
    }
}

export default withApollo(Search)
