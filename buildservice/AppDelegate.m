/*
 Licensed to the Apache Software Foundation (ASF) under one
 or more contributor license agreements.  See the NOTICE file
 distributed with this work for additional information
 regarding copyright ownership.  The ASF licenses this file
 to you under the Apache License, Version 2.0 (the
 "License"); you may not use this file except in compliance
 with the License.  You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing,
 software distributed under the License is distributed on an
 "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 KIND, either express or implied.  See the License for the
 specific language governing permissions and limitations
 under the License.
 */

//
//  AppDelegate.m
//  test
//
//  Created by ___FULLUSERNAME___ on ___DATE___.
//  Copyright ___ORGANIZATIONNAME___ ___YEAR___. All rights reserved.
//
#import "AppDelegate.h"
#import "MainViewController.h"

@implementation AppDelegate

- (BOOL)application:(UIApplication*)application didFinishLaunchingWithOptions:(NSDictionary*)launchOptions
{
    NSMutableArray *cookiesData = [[NSUserDefaults standardUserDefaults] valueForKey:@"xapp"];
    if (cookiesData) {
        for (NSMutableDictionary *cookie in cookiesData)
        {
            NSHTTPCookie *c = [NSHTTPCookie cookieWithProperties:cookie];
            [[NSHTTPCookieStorage sharedHTTPCookieStorage] setCookie:c];
        }
    }
    self.viewController = [[MainViewController alloc] init];
    return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

- (void)applicationDidEnterBackground:(UIApplication *)application{
    NSArray *cookies = [[NSHTTPCookieStorage sharedHTTPCookieStorage] cookies];
    NSMutableArray *dt = [NSMutableArray array];
    for(NSHTTPCookie *cookie in cookies) {
        NSMutableDictionary *cookieProperties = [NSMutableDictionary dictionary];
        [cookieProperties setValue:cookie.name forKey:NSHTTPCookieName];
        [cookieProperties setValue:cookie.domain forKey:NSHTTPCookieDomain];
        [cookieProperties setValue:cookie.path forKey:NSHTTPCookiePath];
        [cookieProperties setValue:cookie.value forKey:NSHTTPCookieValue];
        [cookieProperties setObject:@"true" forKey:@"HttpOnly"];
        [cookieProperties setValue:cookie.expiresDate forKey: NSHTTPCookieExpires];
        [dt addObject:cookieProperties];
    }
    [[NSUserDefaults standardUserDefaults] setValue:dt
                                              forKey:@"xapp"];
    [[NSUserDefaults standardUserDefaults] synchronize];
}

@end
