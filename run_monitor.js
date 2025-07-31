const { chromium } = require('playwright');

async function runMonitoring() {
    let iteration = 1;
    const maxIterations = 10;
    
    console.log('Starting Playwright monitoring for http://localhost:5173/');
    console.log(`Maximum iterations: ${maxIterations}`);
    
    while (iteration <= maxIterations) {
        console.log(`\n=== Iteration ${iteration}/${maxIterations} ===`);
        
        let browser;
        try {
            browser = await chromium.launch({ headless: false });
            const context = await browser.newContext();
            const page = await context.newPage();
            
            // Capture console errors
            const consoleErrors = [];
            page.on('console', msg => {
                if (msg.type() === 'error') {
                    console.log(`Console error: ${msg.text()}`);
                    consoleErrors.push(msg.text());
                }
            });
            
            // Capture page errors
            const pageErrors = [];
            page.on('pageerror', error => {
                console.log(`Page error: ${error.toString()}`);
                pageErrors.push(error.toString());
            });
            
            console.log('Navigating to http://localhost:5173/...');
            await page.goto('http://localhost:5173/', { 
                waitUntil: 'networkidle',
                timeout: 10000 
            });
            
            // Wait for the page to fully render
            await page.waitForTimeout(3000);
            
            // Check if page has content and is not black screen
            const pageAnalysis = await page.evaluate(() => {
                const body = document.body;
                const html = document.documentElement;
                const computedStyle = window.getComputedStyle(body);
                
                // Get all text content
                const textContent = body.innerText || body.textContent || '';
                
                // Check for React root or main app container
                const appContainer = document.querySelector('#root') || 
                                   document.querySelector('#app') || 
                                   document.querySelector('[data-reactroot]');
                
                return {
                    backgroundColor: computedStyle.backgroundColor,
                    color: computedStyle.color,
                    hasTextContent: textContent.trim().length > 0,
                    childrenCount: body.children.length,
                    htmlChildrenCount: html.children.length,
                    hasAppContainer: !!appContainer,
                    appContainerHasContent: appContainer ? appContainer.children.length > 0 : false,
                    bodyInnerHTML: body.innerHTML.slice(0, 500) // First 500 chars for debugging
                };
            });
            
            console.log('Page analysis:', {
                hasTextContent: pageAnalysis.hasTextContent,
                childrenCount: pageAnalysis.childrenCount,
                hasAppContainer: pageAnalysis.hasAppContainer,
                appContainerHasContent: pageAnalysis.appContainerHasContent,
                backgroundColor: pageAnalysis.backgroundColor
            });
            
            // Check for black screen indicators
            const isBlackScreen = (
                !pageAnalysis.hasTextContent || 
                pageAnalysis.childrenCount === 0 || 
                (!pageAnalysis.hasAppContainer || !pageAnalysis.appContainerHasContent) ||
                consoleErrors.length > 0 || 
                pageErrors.length > 0
            );
            
            await browser.close();
            
            if (!isBlackScreen) {
                console.log('✅ Page appears to be loading correctly!');
                console.log('Monitoring completed successfully.');
                return;
            }
            
            console.log('❌ BLACK SCREEN DETECTED!');
            
            // Collect all error messages
            const allErrors = [...consoleErrors, ...pageErrors];
            
            if (allErrors.length === 0) {
                allErrors.push('Black screen detected: No visible content or empty app container');
                console.log('Debug info - Body HTML preview:', pageAnalysis.bodyInnerHTML);
            }
            
            console.log(`Found ${allErrors.length} error(s):`, allErrors);
            
            // Report errors and request fix
            console.log('\n🔧 Invoking primary coding agent to fix the errors...');
            
            const errorReport = allErrors.join('\n');
            console.log(`Error report for iteration ${iteration}:\n${errorReport}`);
            
            // Since we can't directly invoke another agent, we'll output the error and wait
            console.log('\n📋 ERRORS TO FIX:');
            console.log('==================');
            allErrors.forEach((error, index) => {
                console.log(`${index + 1}. ${error}`);
            });
            console.log('==================');
            console.log('Please fix these bugs that are causing a black screen at http://localhost:5173/');
            
            // Pause for manual intervention
            console.log('\n⏳ Waiting 30 seconds before next check...');
            await new Promise(resolve => setTimeout(resolve, 30000));
            
            iteration++;
            
        } catch (error) {
            console.log('❌ Navigation/Browser error:', error.message);
            if (browser) {
                await browser.close();
            }
            
            console.log('\n📋 ERROR TO FIX:');
            console.log('=================');
            console.log(`Navigation error: ${error.message}`);
            console.log('=================');
            console.log('Please fix this bug that is preventing http://localhost:5173/ from loading');
            
            console.log('\n⏳ Waiting 30 seconds before next check...');
            await new Promise(resolve => setTimeout(resolve, 30000));
            
            iteration++;
        }
    }
    
    console.log(`\n❌ Maximum iterations (${maxIterations}) reached without resolution.`);
    console.log('Monitoring stopped.');
}

// Handle cleanup on exit
process.on('SIGINT', () => {
    console.log('\n👋 Monitoring stopped by user.');
    process.exit(0);
});

runMonitoring().catch(error => {
    console.error('Fatal error in monitoring:', error);
    process.exit(1);
});