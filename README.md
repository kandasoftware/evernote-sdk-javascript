<h1>Evernote SDK for Javacsript</h1>

Evernote API version 1.22

<h2>Overview</h2>
<p>This SDK contains wrapper code used to call the Evernote Cloud API from javascript apps.</p>
<p>The SDK also contains some samples. The code in javascript/background.js demonstrates the basic use of the SDK to access the Evernote Cloud API.</p>

<h2>Prerequisites</h2>
<p>In order to use the code in this SDK, you need to obtain an API key from http://dev.evernote.com/documentation/cloud. You'll also find full API documentation on that page.</p>

<p>In order to run the sample code, you need a user account on the sandbox service where you will do your development. Sign up for an account at https://sandbox.evernote.com/Registration.action</p>

<h2>Getting Started</h2>

<p>The sample application demonstrates how to use the Evernote SDK for javascript apps to authentication to the Evernote service using OAuth, then access the user's Evernote account. To run the sample project:</p>
<ul>
<li>edit src\main\resources\javascript\auth.js with your correct params</li>
<li>go to Google Chrome - settings - extentions</li>
<li>load unpack extention src\main\resources\</li>
<li>you will see JS icon on the toolbar in the browser</li>
<li>app will be trying to authenticate to the Evernote using your paramms from auth.js</li>
<li>if authentication will be successfull you can click to JS icon and open test page</li>
<li>sample gets user, list of user's notebooks and add test note to default notebook</li>
</ul>